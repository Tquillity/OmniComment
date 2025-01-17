// auth-controller.mjs
import User from '../models/UserModel.mjs';
import Wallet from '../models/Wallet.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import { INITIAL_BALANCE } from '../config/settings.mjs';


// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  PUBLIC
export const register = asyncHandler(async (req, res, next) => {
  const  { username, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorResponse('Passwords do not match', 400));
  }

  const wallet = new Wallet();
  
  const user = await User.create({
    username,
    email,
    password,
    role,
    walletPublicKey: wallet.publicKey,
    balance: INITIAL_BALANCE,
  });

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

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const isCorrect = await user.validatePassword(password);

  if (!isCorrect) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const wallet = new Wallet();
  wallet.publicKey = user.walletPublicKey;

  createAndSendToken(user, 200, res);
});

// @desc    Returns information on the logged in user
// @route   GET /api/v1/auth/me
// @access  PRIVATE
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('comment');


  res.status(200).json({
    success: true,
    statusCode: 200,
    data: user,
  });
});

// @desc    Update user details
// @route   GET /api/v1/auth/updateuser
// @access  PRIVATE
export const updateUserDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: user,
  });
});

// @desc    Update user password
// @route   GET /api/v1/auth/updatepassword
// @access  PRIVATE
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if(!(await user.validatePassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  createAndSendToken(user, 200, res);
});


// @desc    Forgot password
// @route   GET /api/v1/auth/forgotpassword
// @access  PUBLIC
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const email = req.body.email;
  
  if (!email) {
    return next(new ErrorResponse('Please provide an email', 400));
  }

  let user = await User.findOne({ email });

  if(!user) {
    return next(new ErrorResponse(`No user with the email ${email} found`, 400));
  }

  const resetToken = user.resetPasswordToken();
  await user.save ({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
  
  res.status(200).json({
    success: true,
    statusCode: 201,
    data: { token: resetToken, url: resetURL },
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:token
// @access  PUBLIC
export const resetPassword = asyncHandler(async (req, res, next) => {
  const password = req.body.password;
  const token = req.params.token;

  if (!password) {
    return next(new ErrorResponse('Please provide a password', 400));
  }

  let user = await User.findOne({ resetPasswordToken: token});

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;

  await user.save();

  createAndSendToken(user, 200, res);
});

const createAndSendToken = (user, statusCode, res) => {
  const token = user.generateToken()

  res.status(statusCode).json({success: true, statusCode, token});
};
