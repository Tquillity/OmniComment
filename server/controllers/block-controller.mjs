// block-controller.mjs
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import { blockchain, pubnubServer, transactionPool, wallet } from '../server.mjs';
import Comment from '../models/CommentsModel.mjs';
import Transaction from '../models/Transaction.mjs';
import User from '../models/UserModel.mjs';

export const mineBlock = asyncHandler(async(req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1];
  const newComments = await Comment.find({ createdAt: { $gt: lastBlock.timestamp }});

  // Create a mining reward transaction
  const minerPublicKey = req.body.minerPublicKey;
  const rewardTransaction = Transaction.transactionReward({ miner: { publicKey: minerPublicKey } });

  // Add the reward transaction to the transaction pool
  transactionPool.addTransaction(rewardTransaction);

  // Get all valid transactions from the pool
  const validTransactions = transactionPool.validateTransactions();

  // Add new comments and valid transactions to the block data
  const blockData = [...newComments, ...validTransactions];

  const block = await blockchain.addBlock({ data: blockData });

  // Clear the mined transactions from the pool
  transactionPool.clearBlockTransactions({ chain: blockchain.chain });

  // Update the miner's balance
  const miner = await User.findOne({ walletPublicKey: minerPublicKey });
  if (miner) {
    const rewardAmount = rewardTransaction.outputMap[minerPublicKey];
    miner.balance += rewardAmount;
    await miner.save();
  }

  pubnubServer.broadcast();

  res.status(201).json({ success: true, statusCode: 201, data: block});
});