const express = require('express');
const User = require('../models/user');
const userrouter = express.Router();
const jwtauth = require('../middlewares/jwtauth');
// Update user details
userrouter.put('/userprofile', jwtauth, async (req, res) => {
    try {
      // Get user ID from the authenticated token
      const userId = req.session.userId;
  
      // Data to be updated
      const {profilepic, phnnum, username, gender, dob } = req.body;
  
      // Find the user by ID and update the details
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            profilepic,
            phnnum,
            username,
            gender,
            dob
          }
        },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ message: 'User details updated successfully', user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
userrouter.get('/userprofile', jwtauth, async (req, res) => {
try {
    // Get user ID from the authenticated token
    const userId = req.session.userId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
    return res.status(404).json({ message: 'User not found' });
    }

    // Return the user details
    res.json(user);
} catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
}
});
module.exports = userrouter;