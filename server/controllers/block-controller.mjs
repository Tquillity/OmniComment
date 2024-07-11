import { asyncHandler } from '../middleware/asyncHandler.mjs';
import { blockchain, pubnubServer } from '../server.mjs';
import Comment from '../models/CommentsModel.mjs';

export const mineBlock = asyncHandler(async(req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1];
  const newComments = await Comment.find({ createdAt: { $gt: lastBlock.timestamp }});

  const block = blockchain.addBlock({ data: newComments });

  pubnubServer.broadcast();

  res.status(201).json({ success: true, statusCode: 201, data: block});
});