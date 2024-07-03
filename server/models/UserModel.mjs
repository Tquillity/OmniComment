import mongoose from 'mongoose';

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
    enum: ['user', 'manager'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // This field will not be returned in the response
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', userSchema);