const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, required: false },
  googleId: { type: String, unique: true, sparse: true } // Google ID for users authenticated via Google
});

const User = mongoose.model('User', userSchema);

module.exports = User;
