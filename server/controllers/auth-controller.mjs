import User from '../models/UserModel.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  PUBLIC
export const register = asyncHandler(async (req, res, next) => {
  const  { username, email, password, role } = req.body;

  const user = await User.create({ username, email, password, role });

  createAndSendToken(user, 201, res);
});

// @desc    User login
// @route   POST /api/v1/auth/login
// @access  PUBLIC
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // question to mongoose to return the email
  const user = await User.findOne({ email }).select('+password'); // PROJECT the password field

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if the password matches
  const isCorrect = await user.validatePassword(password);

  if (!isCorrect) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  createAndSendToken(user, 200, res);
});

// @desc    Returns information on the logged in user
// @route   GET /api/v1/auth/me
// @access  PRIVATE
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);


  res.status(200).json({
    success: true,
    statusCode: 200,
    data: user,
  });
});

// @desc    Forgot password
// @route   GET /api/v1/auth/forgotpassword
// @access  PUBLIC
export const forgotPassword = async (req, res, next) => {
  res.status(200).json({
    success: true,
    statusCode: 201,
    data: 'Forgot password functionality works',
  });
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:token
// @access  PUBLIC
export const resetPassword = async (req, res, next) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: 'Reset password functionality works',
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = user.generateToken()

  res.status(statusCode).json({success: true, statusCode, token});
};
