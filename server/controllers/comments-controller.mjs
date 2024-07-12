import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import Comment from '../models/CommentsModel.mjs';
import { transactionPool } from '../server.mjs';
import Transaction from '../models/Transaction.mjs';
import { ellipticHash, createHash } from '../utilities/crypto-lib.mjs';
import User from '../models/UserModel.mjs';

// @desc  Add a comment
// @route POST /api/v1/comments
// @access  PRIVATE
export const addComment = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('User not authenticated', 401));
  }

  const user = await User.findById(req.user._id).select('+walletPrivateKey');
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  let commentData = req.body;
  const cost = commentData.parentTopic ? 10 : 20;

  if (user.balance < cost) {
    return next(new ErrorResponse('Insufficient balance', 400));
  }

  const rewardUser = await User.findOne({ role: 'reward' });
  if (!rewardUser) {
    return next(new Error('Reward user not found'));
  }

  const transaction = new Transaction({
    sender: {
      publicKey: user.walletPublicKey,
      balance: user.balance,
      sign: (data) => {
        // ! In a real application, private key would never be exposed like this
        // ! This is just for demonstration purposes for use in this school project
        const keyPair = ellipticHash.keyFromPrivate(user.walletPrivateKey, 'hex');
        return keyPair.sign(createHash(data)).toDER('hex');
      }
    },
    recipient: rewardUser.walletPublicKey,
    amount: cost,
  });

  rewardUser.balance += cost;
  await rewardUser.save();

  transactionPool.addTransaction(transaction);

  user.balance -= cost;
  await user.save();

  const comment = await Comment.create(commentData);

  res.status(201).json({
    success: true,
    statusCode: 201,
    data: comment,
  });
});

// @desc  Delete a comment
// @route DELETE /api/v1/comments/:id
// @access  PRIVATE
export const deleteComment = asyncHandler(async(req, res, next) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.status(204).send(); // 204 No Content
});

// @desc  Search for a comment
// @route GET /api/v1/comments/:id
// @access  Public
export const getComment = asyncHandler(async(req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
  }
 
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: comment,
  });
});

// @desc Fetch all comments
// @route GET /api/v1/comments/
// @access PUBLIC
export const getComments = asyncHandler(async(req, res, next) => {
  let query;
  let queryString;
  let reqQuery = { ...req.query };
  const excludeFields = ['select', 'sort', 'page', 'pageSize'];
  excludeFields.forEach(field => delete reqQuery[field]);
  
  queryString = JSON.stringify(reqQuery).replace(
    /\b(lt|lte|gt|gte|in)\b/g,
    match => `$${match}`
  );

  query = Comment.find(JSON.parse(queryString));

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort({ isMainTopic: -1, createdAt: -1 });
  }

  const totalDocuments = await Comment.countDocuments(JSON.parse(queryString));
  const pageNo = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || totalDocuments;
  const skip = (pageNo - 1) * pageSize;

  query = query.skip(skip).limit(pageSize);

  const comments = await query;

  const processedComments = comments.reduce((acc, comment) => {
    if (!comment.parentTopic) {
      acc.push({
        ...comment.toObject(),
        comments: comments.filter(c => c.parentTopic === comment.title)
      });
    }
    return acc;
  }, []);

  const pagination = {
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / pageSize),
  };

  if (skip + pageSize < totalDocuments) {
    pagination.next = { page: pageNo + 1, pageSize };
  }

  if (skip > 0) {
    pagination.prev = { page: pageNo - 1, pageSize };
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    items: processedComments.length,
    pagination,
    data: processedComments,
  });
});

// @desc  Update a comment
// @route PUT /api/v1/comments/
// @access  PRIVATE
export const updateComment = asyncHandler(async(req, res, next) => {
  const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: comment,
  });
});