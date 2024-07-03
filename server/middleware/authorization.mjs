import jwt from 'jsonwebtoken';
import User from '../models/UserModel.mjs';
import { asyncHandler } from './asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  if (!token) {
    next(new ErrorResponse('Not authorized to access this route', 401));
  }

  // Verify token fetched from the header
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedToken.id); // Looking for the user in the Mongo database

  if(!req.user) {
    next(new ErrorResponse('Not authorized to access this route', 401));
  }

  next();
});

// authorize('admin', 'manager', 'user')
export const authorize = (...roles) => {
  return(req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};