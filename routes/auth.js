const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sendVerificationEmail = require('../mailer');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Registration route
router.post('/register', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const verificationCode = uuidv4();
    user = new User({ email, verificationCode, password: 'placeholder' });
    await user.save();
    await sendVerificationEmail(email, verificationCode);
    res.status(201).json({ msg: 'Verification email sent' });
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

module.exports = router;
