// @desc  Add a comment
// @route POST /api/v1/comments
// @access  PRIVATE
export const addComment = (req, res, next) => {
  res.status(201).json({ 
    success: true,
    statusCode: 201,
    message: "Comment added",
  });
};

// @desc  Delete a comment
// @route DELETE /api/v1/comments/:id
// @access  PRIVATE
export const deleteComment = (req, res, next) => {
  res.status(200).json({
    success: true, 
    statusCode: 204, 
    message: `Comment deleted for id ${req.params.id}`,
  });
};

// @desc  Search for a comment
// @route GET /api/v1/comments/:id
// @access  Public
export const getComment = (req, res, next) => {
 res.status(200).json({
  success: true,
  statusCode: 200,
  message: `GetComments working for id ${req.params.id}`,
 });
};

// @desc  Fetch all comments
// @route GET /api/v1/comments/
// @access  PUBLIC
export const getComments = (req, res, next) => {
  res.status(200).json({
   success: true,
   statusCode: 200,
   message: 'GetComments working',
  });
};

// @desc  Update a comment
// @route PUT /api/v1/comments/
// @access  PRIVATE
export const updateComment = (req, res, next) => {
  res.status(200).json({
   success: true,
   statusCode: 204,
   message: 'updateComment working',
  });
};