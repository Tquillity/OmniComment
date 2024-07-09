import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import Comment from '../models/CommentsModel.mjs';
import { transactionPool } from '../server.mjs';

// @desc  Add a comment
// @route POST /api/v1/comments
// @access  PRIVATE
export const addComment = asyncHandler(async (req, res, next) => {
  let commentData = req.body;
  
  if (commentData.title.includes('.')) {
    if (!commentData.parentTopic) {
      return next(new ErrorResponse('Parent topic is required for comments', 400));
    }
  } else {
    commentData.parentTopic = null;
  }

  // Check if transactionId is provided
  if (!commentData.transactionId) {
    return next(new ErrorResponse('Transaction ID is required', 400));
  }

  // Verify that the transaction exists
  const transaction = await transactionPool.transactionMap[commentData.transactionId];
  if (!transaction) {
    return next(new ErrorResponse('Invalid Transaction ID', 400));
  }

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

  if (!comment)
    return next(
      new ErrorResponse(
        `Comment not found with id of ${req.params.id}`,
        404
      )
    );
 
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
  const excludeFields = ['select', 'sort', 'page', 'pageSize', 'since'];
  excludeFields.forEach(field => delete reqQuery[field]);
  
  queryString = JSON.stringify(reqQuery).replace(
    /\b(lt|lte|gt|gte|in)\b/g,
    match => `$${match}`
  );

  console.log('Query String:', queryString); // ! Debugging

  // Creates a query but does not execute it
  query = Comment.find(JSON.parse(queryString));

   // Handle 'since' parameter
   if (req.query.since) {
    const sinceDate = new Date(parseInt(req.query.since));
    query = query.where('createdAt').gte(sinceDate);
  }

  // SELECT (Projection): If asked for a specific selection of fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // SORT: If asked to sort the results
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // Default sort: main topics first, then by creation date
    query = query.sort({ isMainTopic: -1, createdAt: -1 });
  }

  // PAGINATION: If asked for pagination
  const totalDocuments = await Comment.countDocuments(JSON.parse(queryString));
  const pageNo = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || totalDocuments;
  const skip = (pageNo - 1) * pageSize;

  query = query.skip(skip).limit(pageSize);

  // Execute the query
  const comments = await query;
  console.log('Comments found:', comments.length); // ! Debugging

  // Process comments to group them by main topics
  const processedComments = comments.reduce((acc, comment) => {
    if (!comment.parentTopic) {
      // This is a main topic
      acc.push({
        ...comment.toObject(),
        comments: comments.filter(c => c.parentTopic === comment.title)
      });
    }
    return acc;
  }, []);

  const pagination = {};
  pagination.totalDocuments = totalDocuments;
  pagination.totalPages = Math.ceil(totalDocuments / pageSize);

  if (skip + pageSize < totalDocuments) {
    pagination.next = {
      page: pageNo + 1,
      pageSize,
    };
  }

  if (skip > 0) {
    pagination.prev = {
      page: pageNo - 1,
      pageSize,
    };
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
  const comment =  await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: comment,
  });
});