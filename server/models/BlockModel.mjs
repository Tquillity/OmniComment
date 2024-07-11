// BlockModel.mjs
import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true
  },
  lastHash: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  },
  nonce: {
    type: Number,
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

export default mongoose.model('Block', blockSchema);