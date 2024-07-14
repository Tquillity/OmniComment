// CommentModel.mjs
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  commentNumber: {
    type: Number,
    unique: [true, 'Duplicate comment number not allowed'],
    required: [true, 'Comment number is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    unique: false,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  isMainTopic: {
    type: Boolean,
    default: function() {
      return !this.title.includes('.');
    }
  },
  parentTopic: {
    type: String,
    required: function() {
      return this.title.includes('.');
    },
    default: null
  },
  subject: {
    type: String,
    required: true,
    unique: false,
    validate: {
      validator: function(v) {
        if (v.startsWith('1337')) {
          return v.length <= 1337;
        } else {
          return v.length <= 1000;
        }
      },
      message: props => `Subject cannot be more than ${props.value.startsWith('1337') ? 1337 : 1000} characters`
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

commentSchema.index({ title: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);