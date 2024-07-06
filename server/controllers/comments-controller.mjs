import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import Comment from '../models/CommentsModel.mjs';

// @desc  Add a comment
// @route POST /api/v1/comments
// @access  PRIVATE
export const addComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.create(req.body);
  
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

// @desc  Fetch all comments
// @route GET /api/v1/comments/
// @access  PUBLIC
export const getComments = asyncHandler(async(req, res, next) => {
  
  let query;
  let queryString;
  let reqQuery = { ...req.query };

  const excludeFields = ['select', 'sort', 'page', 'pageSize']; // Exclude these fields from the request query
  excludeFields.forEach(field => delete reqQuery[field]);

  queryString = JSON.stringify(reqQuery).replace(
    /\b(lt|lte|gt|gte|in)\b/g, 
    match => `$${match}`
  ); // ! Studdy "Regular Expressions"
  
  // Creates a query but does not execute it
  query = Comment.find(JSON.parse(queryString));
  
  // SELECT (Projection): If asked for a specific selection of fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    // Select only the fields requested
    query = query.select(fields);
  }

  // SORT: If asked to sort the results
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  }

  // PAGINATION: If asked for pagination
  const pages = await Comment.countDocuments(JSON.parse(queryString));
  const pageNo = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || pages;
  const page = (pageNo - 1) * pageSize;

  // Skip the number of documents to get to the page and limit the number of documents to the page size
  query = query.skip(page).limit(pageSize);

  // Execute the query
  const comments = await query;

  const pagination = {};

pagination.totalDocuments = pages;
pagination.totalPages = Math.ceil(pages / pageSize);

  // Are there more pages?
  if (page * pageSize < pages) {
    pagination.next = {
      page: page +1,
      pageSize,
    };
  }

  // Are there previous pages?
  if (page > 0) {
    pagination.prev = {
      page: page -1,
      pageSize,
    };
  }

  res.status(200).json({
   success: true,
   statusCode: 200,
   items: comments.length,
   pagination,
   data: comments,
  });
});

// @desc  Update a comment
// @route PUT /api/v1/comments/
// @access  PRIVATE
export const updateComment = asyncHandler(async(req, res, next) => {
  await Comment.findByIdAndUpdate(req.params.id, req.body);

  res.status(204).send();
});