import User from '../models/UserModel.mjs';


export const register = (req, res, next) => {
  
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Please provide name, email and password",
    });
  }

  const user = new User(name, email, password, role ?? 'user');

  res
    .status(201)
    .json({ success: true, statusCode: 201, data: user });
};

export const login = (req, res, next) => {
  res
    .status(201)
    .json({ success: true, statusCode: 200, message: "User logged in" });
};

export const getMe = (req, res, next) => {
  res
    .status(201)
    .json({ success: true, statusCode: 200, message: "User info retrieved" });
};
