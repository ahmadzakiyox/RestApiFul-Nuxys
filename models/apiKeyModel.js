const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  tier: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  requestCount: {
    type: Number,
    default: 0,
  },
  requestLimit: {
    type: Number,
    default: 10, // Limit default untuk user 'free'
  },
  lastResetDate: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;