import mongoose from "mongoose";

const blockchainStateSchema = new mongoose.Schema({
  latestBlockHash: String,
  latestBlockHeight: Number,
  totalTransactions: Number,
  totalComments: Number,
  totalUsers: Number,
  lastUpdated: Date
});

export default mongoose.model('BlockchainState', blockchainStateSchema);