const express = require('express');
const User = require('../models/user');
const multer = require('multer');
const userrouter = express.Router();
const jwtauth = require('../middlewares/jwtauth');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/profile'); // Directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

const upload = multer({ storage: storage });

// Update user profile including profile picture URL
userrouter.put('/userprofile/:id', jwtauth, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, gender, dob, phnnum, profilepic } = req.body;

    console.log('User ID:', userId);
    console.log('Profile update data:', req.body);

    const updateData = {
      username,
      gender,
      dob,
      phnnum,
      profilepic
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User details updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch user profile
userrouter.get('/userprofile/:id', jwtauth, async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('Fetching profile for user ID:', userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = userrouter;
