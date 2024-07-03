import ErrorResponse from '../models/ErrorResponseModel.mjs';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err }; 

  error.message = err.message;

  if (err.code === 11000) {
    const message = 'User already exists';
    error = new ErrorResponse(message, 400);
  }

  if (err.username === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(`Value missing: ${message}`, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || 'Server Error',
  });
};