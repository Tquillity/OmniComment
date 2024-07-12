// block-controller.mjs
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import { blockchain, pubnubServer, transactionPool, wallet } from '../server.mjs';
import Comment from '../models/CommentsModel.mjs';
import Transaction from '../models/Transaction.mjs';
import User from '../models/UserModel.mjs';
import { MINING_REWARD } from '../config/settings.mjs';

export const mineBlock = asyncHandler(async(req, res, next) => {
  console.log('Starting block mining process...');
  
  const lastBlock = blockchain.chain[blockchain.chain.length - 1];
  console.log('Last block:', lastBlock);
  
  const newComments = await Comment.find({ createdAt: { $gt: lastBlock.timestamp }});
  console.log('New comments:', newComments);
  
  // Find the reward user
  const rewardUser = await User.findOne({ role: 'reward' });
  if (!rewardUser) {
    console.error('Reward user not found');
    return next(new Error('Reward user not found'));
  }
  console.log('Reward user:', rewardUser);
  
  // Create a mining reward transaction
  const minerPublicKey = req.body.minerPublicKey;
  const rewardTransaction = await Transaction.transactionReward({ miner: { publicKey: minerPublicKey } });
  console.log('Reward transaction:', rewardTransaction);
  
  // Add the reward transaction to the transaction pool
  transactionPool.addTransaction(rewardTransaction);
  console.log('Transaction pool after adding reward:', transactionPool);
  
  // Get all valid transactions from the pool
  const validTransactions = transactionPool.validateTransactions();
  console.log('Valid transactions:', validTransactions);
  
  // Ensure the reward transaction is included in valid transactions
  if (!validTransactions.some(t => t.id === rewardTransaction.id)) {
    console.error('Reward transaction not found in valid transactions');
    validTransactions.push(rewardTransaction);
  }
  
  // Add new comments and valid transactions to the block data
  const blockData = [...newComments, ...validTransactions];
  console.log('Block data:', blockData);
  
  const block = await blockchain.addBlock({ data: blockData });
  console.log('New block added:', block);
  
  // Clear the mined transactions from the pool
  console.log('Transaction pool before clearing:', transactionPool);
  transactionPool.clearBlockTransactions({ chain: blockchain.chain });
  console.log('Transaction pool after clearing:', transactionPool);
  
  // Update the miner's balance
  const miner = await User.findOne({ walletPublicKey: minerPublicKey });
  if (miner) {
    const rewardAmount = rewardTransaction.outputMap[minerPublicKey];
    miner.balance += rewardAmount;
    await miner.save();
    console.log('Miner updated:', miner);
  }
  
  // Deduct the reward amount from the reward user's balance
  rewardUser.balance -= MINING_REWARD;
  if (rewardUser.balance < 0) {
    console.error('Insufficient balance in reward wallet');
    return next(new Error('Insufficient balance in reward wallet'));
  }
  await rewardUser.save();
  console.log('Reward user after deduction:', rewardUser);
  
  pubnubServer.broadcast();
  console.log('Block mining process completed');
  
  res.status(201).json({ success: true, statusCode: 201, data: block});
});