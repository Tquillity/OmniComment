// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  PUBLIC
export const register = async (req, res, next) => {
  res.status(201).json({
    success: true,
    statusCode: 201,
    data: 'User has been registered successfully',
  });
};

// @desc    User login
// @route   POST /api/v1/auth/login
// @access  PUBLIC
export const login = async (req, res, next) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: 'User has been logged in successfully',
  });
};

// @desc    Returns information on the logged in user
// @route   GET /api/v1/auth/me
// @access  PRIVATE
export const getMe = async (req, res, next) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: 'Show user profile for logged in user',
  });
};

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

const createAndSendToken = (id, statusCode, res) => {};
