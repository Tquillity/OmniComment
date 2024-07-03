import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
}

export const hashPassword = (password) => {
  const hash = bcrypt.hashSync(password, 10);
  return hash;

};

export const validatePassword = async(passwordToCheck, password) => {
  return await bcrypt.compare(passwordToCheck, password);
};