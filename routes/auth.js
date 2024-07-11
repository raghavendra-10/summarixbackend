const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {User,Audio} = require('../models/user');
const sendVerificationEmail = require('../mailer');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Registration route
router.post('/register', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const verificationCode = generateOTP();
    user = new User({ email, verificationCode, password: 'placeholder' });
    await user.save();
    await sendVerificationEmail(email, verificationCode);
    res.status(200).json({ msg: 'Verification email sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Verify email
router.post('/verify', async (req, res) => {
  const { email, code, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    res.status(200).json({ msg: 'Email verified and password set' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please verify your email first' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = { id: user.id, email: user.email };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Google Sign-In route
router.post('/google/callback', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ email, googleId, isVerified: true });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token: jwtToken });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Audio URL route
router.post('/audiourl', async (req, res) => {
  const { url, userid } = req.body;
  try {
    const user = await User.findById(userid);
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const newAudio = new Audio({
      userId: user._id,
      audioUrl: url,
      uploadedDate: new Date()
    });

    await newAudio.save();
    res.status(200).json({ msg: 'Audio URL saved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/audiourl/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const audioRecords = await Audio.find({ userId: id });
    if (audioRecords.length === 0) {
      return res.status(404).json({ msg: 'No audio records found for this user' });
    }
    res.status(200).json(audioRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
