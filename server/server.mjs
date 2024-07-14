// server.mjs
import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/mongo.mjs';
import colors from 'colors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize'; // Data sanitization against NoSQL query injection
import helmet from 'helmet'; // Set security HTTP headers
import xss from 'xss-clean'; // Data sanitization against XSS
import rateLimit from 'express-rate-limit'; // Limit request from the same API
import hpp from 'hpp'; // HTTP Parameter Pollution attacks
import cors from 'cors'; // Enable CORS
import path from 'path';
import  { fileURLToPath } from 'url';
import Blockchain from './models/Blockchain.mjs';
import TransactionPool from './models/TransactionPool.mjs';
import Wallet from './models/Wallet.mjs';
import blockRouter from './routes/block-routes.mjs';
import blockchainRouter from './routes/blockchain-routes.mjs';
import transactionRouter from './routes/transaction-routes.mjs';
import PubNubServer from './pubnub-server.mjs';
import authRouter from './routes/auth-routes.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import commentRouter from './routes/comments-routes.mjs';
import usersRouter from './routes/user-routes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.__appdir = __dirname;
dotenv.config({ path: path.join(__dirname, 'config', 'config.env')});

connectDb();

const credentials = {
  publishKey: process.env.PUBLISH_KEY,
  subscribeKey: process.env.SUBSCRIBE_KEY,
  secretKey: process.env.SECRET_KEY,
  userId: process.env.USER_ID,
};

export const blockchain = new Blockchain();
export const transactionPool = new TransactionPool();
export const wallet = new Wallet();
export const pubnubServer = new PubNubServer({
  blockchain: blockchain,
  transactionPool: transactionPool,
  wallet: new Wallet(),
  credentials: credentials,
});

// Initialize an Express application
const app = express();

// Middleware...
app.use(morgan('dev'));

// Body parser...
app.use(express.json());

// ! Security Middleware - Middleware consider lifting out to a separate file
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Set security HTTP headers
app.use(helmet());

// Apply CSP only to index.html
app.use((req, res, next) => {
  if (req.url.startsWith('/api-docs.html')) {
   helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
   })(req, res, next);
  } else {
    next();
  }
});

// Data sanitization against XSS
app.use(xss());

const limit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
});

app.use(limit);

// Enable CORS
app.use(cors());

// Prevent HTTP Parameter Pollution attacks
app.use(hpp());

// ! End of Security - Middleware consider lifting out to a separate file

// Serve static files
app.use(express.static(path.join(__appdir, 'public')));

// Endpoint definitions
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/users', usersRouter);

// Serve the API documentation
app.get('/api-docs.html', (req, res) => {
  res.sendFile(path.join(__appdir, 'public', 'api-docs.html'));
});

const DEFAULT_PORT = 5001;
const ROOT_NODE = `http://localhost:${DEFAULT_PORT}`;

let NODE_PORT;

setTimeout(() => {
  pubnubServer.broadcast();
}, 1000);

// Routes setup for functionalities
app.use('/api/v1/blockchain', blockchainRouter);
app.use('/api/v1/block', blockRouter);
app.use('/api/v1/wallet', transactionRouter);

const synchronize = async () => {
  let response = await fetch(`${ROOT_NODE}/api/v1/blockchain`);
  if (response.ok) {
    const result = await response.json();
    blockchain.replaceChain(result.data);
  }

  response = await fetch(`${ROOT_NODE}/api/v1/wallet/transactions`);
  if (response.ok) {
    const result =  await response.json();
    transactionPool.replaceTransactionMap(result.data);
  }
};

if (process.env.GENERATE_NODE_PORT === 'true') {
  NODE_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
app.use(errorHandler);

const PORT = NODE_PORT || DEFAULT_PORT;

const startServer = async () => {
  try {
    await blockchain.initializeChain();

    const server = app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`.green.bgBlack);

    if (PORT !== DEFAULT_PORT) {
      synchronize();
    }
  });

  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(() => process.exit(1));
  });
  
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();