const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, required: false },
  googleId: { type: String, unique: true, sparse: true } // Google ID for users authenticated via Google
});

const User = mongoose.model('User', userSchema);

const audioSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  audioUrl: { 
    type: String, 
    required: true 
  },
  uploadedDate: { 
    type: Date, 
    default: Date.now 
  }
});

const Audio = mongoose.model('Audio', audioSchema);

module.exports = { User, Audio };
