import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import  { fileURLToPath } from 'url';
import Blockchain from './models/Blockchain.mjs';
import TransactionPool from './models/TransactionPool.mjs';
import Wallet from './models/Wallet.mjs';
import blockRouter from './routes/block-routes.mjs';
import blockchainRouter from './routes/blockchain-routes.mjs';
import transactionRouter from './routes/transaction-routes.mjs';
import PubNubServer from './pubnub-server.mjs';

// Load environment variables from config.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config', 'config.env')});

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

// Middleware to parse JSON data
app.use(express.json());

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

// Set the port to either the dynamically generated port or the default port
const PORT = NODE_PORT || DEFAULT_PORT;

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);

  // If the port is not the default port, synchronize the blockchain
  if (PORT !== DEFAULT_PORT) {
    synchronize();
  }
});