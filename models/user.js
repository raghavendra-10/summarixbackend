const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, required: false },
  googleId: { type: String, unique: true, sparse: true }, // Google ID for users authenticated via Google
  profilepic: { type: String, required: false }, // URL or path to the profile picture
  phnnum: { 
    type: Number, 
    required: false,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v); // Simple validation for a 10-digit phone number
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  username: { type: String, required: false }, // Username, could be required depending on application logic
  gender: { type: String, required: false, enum: ['Male', 'Female', 'Other'] }, // Gender with possible values
  dob: { type: Date, required: false } // Date of birth
});

const User = mongoose.model('User', userSchema);

module.exports = User;
