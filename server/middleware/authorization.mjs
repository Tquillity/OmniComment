import jwt from 'jsonwebtoken';
import { readFileAsync } from '../utilities/fileHandler.mjs';

export const protect = async (req, res, next) => {
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
    return res
      .status(401)
      .json({ success: false, statusCode: 401, message: 'Not authorized to access this route' });
  }
  
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const users = await readFileAsync('data', 'users.json');

    req.user = users.find((u) => u.id === decodedToken.id);
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, statusCode: 401, message: error.message });
  }

  next();
};

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