// userModel.mjs
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { INITIAL_BALANCE } from '../config/settings.mjs';
import { ellipticHash } from '../utilities/crypto-lib.mjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: [true, 'This email is already in use'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ]
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin', 'reward'],
    default: 'user',
    validate: {
      validator: async function (value) {
        //! Check if the role is 'reward' and if another user already has this role
        if (value === 'reward') {
          const existingRewardUser = await this.constructor.findOne({ role: 'reward' });
          if (existingRewardUser && existingRewardUser._id.toString() !== this._id.toString()) {
            throw new Error('Only one user can have the reward role.');
          }
        }
      },
      message: 'Only one user can have the reward role.'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
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
  },
  walletPublicKey: {
    type: String,
    unique: true,
  },
  // ! This is just for demonstration purposes for use in this school project
  // ! In a real application, this would be solved with a secure wallet service
  // ! like MetaMask or a hardware wallet
  walletPrivateKey: {
    type: String,
    select: false, 
  },
  balance: {
    type: Number,
    default: INITIAL_BALANCE,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);

  if (!this.walletPublicKey || !this.walletPrivateKey) {
    const keyPair = ellipticHash.genKeyPair();
    this.walletPublicKey = keyPair.getPublic('hex');
    this.walletPrivateKey = keyPair.getPrivate('hex');
  }
  next();
});

userSchema.methods.validatePassword = async function (passwordToCheck) {
  return await bcrypt.compare(passwordToCheck, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
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
