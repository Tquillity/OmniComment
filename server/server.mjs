import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/mongo.mjs';
import colors from 'colors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
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

// Load environment variables from config.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.__appdir = __dirname;
dotenv.config({ path: path.join(__dirname, 'config', 'config.env')});

// Connect to MongoDB
connectDb();


const credentials = {
  publishKey: process.env.PUBLISH_KEY,
  subscribeKey: process.env.SUBSCRIBE_KEY,
  secretKey: process.env.SECRET_KEY,
  userId: process.env.USER_ID,
};

// Create an instance of Blockchain
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

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Endpoint definitions
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/users', usersRouter);

// Default port ofr the server and Root node URL
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

// Function to synchronize the blockchain with the root node
const synchronize = async () => {
  // fetch the current blockchain from the root node
  let response = await fetch(`${ROOT_NODE}/api/v1/blockchain`);
  if (response.ok) {
    const result = await response.json();
    blockchain.replaceChain(result.data); // Replace the current chain with the fetched chain
  }

  response = await fetch(`${ROOT_NODE}/api/v1/wallet/transactions`);
  if (response.ok) {
    const result =  await response.json();
    transactionPool.replaceTransactionMap(result.data);
  }
};

// Generate a dynamic port if the environment variable is set
if (process.env.GENERATE_NODE_PORT === 'true') {
  NODE_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
// Error handling middleware at the end to happen last
app.use(errorHandler);

// Set the port to either the dynamically generated port or the default port
const PORT = NODE_PORT || DEFAULT_PORT;

// Start the Express server
const server = app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`.green.bgBlack);

  // If the port is not the default port, synchronize the blockchain
  if (PORT !== DEFAULT_PORT) {
    synchronize();
  }
});

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
})