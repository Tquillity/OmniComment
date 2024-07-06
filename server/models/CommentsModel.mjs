import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  commentNumber: {
    type: Number,
    unique: [true, 'Duplicate comment number not allowed'],
    required: [true, 'Comment number is required']
  },
  title: {
    type: String,
    required: false,
    uniqie: false,
    // trim: true // removes leading and trailing white spaces
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subject: {
    type: String,
    required: true,
    unique: false,
    validate: { // Custom validator instead of maxLength
      validator: function(v) {
        // Check if the subject starts with '1337'
        if (v.startsWith('1337')) {
          return v.length <= 1337; // LeatSpeaker activated, allow up to 1337 characters
        } else {
          return v.length <= 1000; // Allow up to 1000 characters
        }
      },
      message: props => `Subject cannot be more than ${props.value.startsWith('1000') ? 1337 : 1000} characters`
    }  
  },
  userName: {
    type: String,
    required: [true, 'Username is required'],
    unique: false,
  },
  sourceAddress: {
    type: String,
    required: [true, 'Source address is required'],
    unique: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  commentVibes: {
    type: String,
    required: [true, 'Comment vibes is required'],
    unique: false,
    enum: ['massively positive', 'positive', 'neutral', 'negative', 'massively negative'],
  },
});

export default mongoose.model('Comment', commentSchema);