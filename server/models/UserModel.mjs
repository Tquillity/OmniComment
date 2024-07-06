import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'], // First argument decides if the field is required, second argument is the error message
    unique: true, // This field should be unique, no doubles usernames allowed
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: [true, 'This email is already in use'], // This field should be unique, no doubles emails allowed
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ]
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // This field will not be returned in the response
  },
  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
  }
});

// Create middleware for mongoose to hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
});

// Method useable on schema instances
userSchema.methods.validatePassword = async function (passwordToCheck) {
  return await bcrypt.compare(passwordToCheck, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id:this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
}

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
  
  this.resetPasswordTokenExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes 

  return this.resetPasswordToken;
};
export default mongoose.model('User', userSchema);