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
  
  const rewardUser = await User.findOne({ role: 'reward' });
  if (!rewardUser) {
    return next(new Error('Reward user not found'));
  }
  
  const minerPublicKey = req.body.minerPublicKey;
  const rewardTransaction = await Transaction.transactionReward({ miner: { publicKey: minerPublicKey } });
  
  transactionPool.addTransaction(rewardTransaction);
  
  const validTransactions = transactionPool.validateTransactions();
  
  if (!validTransactions.some(t => t.id === rewardTransaction.id)) {
    validTransactions.push(rewardTransaction);
  }
  
  const blockData = [...newComments, ...validTransactions];
  
  const block = await blockchain.addBlock({ data: blockData });
  
  transactionPool.clearBlockTransactions({ chain: blockchain.chain });
  
  const miner = await User.findOne({ walletPublicKey: minerPublicKey });
  if (miner) {
    const rewardAmount = rewardTransaction.outputMap[minerPublicKey];
    miner.balance += rewardAmount;
    await miner.save();
  }
  
  rewardUser.balance -= MINING_REWARD;
  if (rewardUser.balance < 0) {
    return next(new Error('Insufficient balance in reward wallet'));
  }
  await rewardUser.save();
  
  pubnubServer.broadcast();
  
  res.status(201).json({ success: true, statusCode: 201, data: block});
});