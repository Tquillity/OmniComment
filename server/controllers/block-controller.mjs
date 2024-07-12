// block-controller.mjs
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import { blockchain, pubnubServer, transactionPool, wallet } from '../server.mjs';
import Comment from '../models/CommentsModel.mjs';
import Transaction from '../models/Transaction.mjs';
import User from '../models/UserModel.mjs';
import { MINING_REWARD } from '../config/settings.mjs';

export const mineBlock = asyncHandler(async(req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1];
  const newComments = await Comment.find({ createdAt: { $gt: lastBlock.timestamp }});

  // Find the reward user
  const rewardUser = await User.findOne({ role: 'reward' });
  if (!rewardUser) {
    return next(new Error('Reward user not found'));
  }

  // Create a mining reward transaction
  const minerPublicKey = req.body.minerPublicKey;
  const rewardTransaction = await Transaction.transactionReward({ miner: { publicKey: minerPublicKey } });

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

  // Deduct the reward amount from the reward user's balance
  rewardUser.balance -= MINING_REWARD;
  if (rewardUser.balance < 0) {
    return next(new Error('Insufficient balance in reward wallet'));
  }
  await rewardUser.save();

  pubnubServer.broadcast();

  res.status(201).json({ success: true, statusCode: 201, data: block});
});