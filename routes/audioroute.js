const express = require('express');
const User = require('../models/user');
const Audio = require('../models/audio');
const audiorouter = express.Router();
const jwtauth = require('../middlewares/jwtauth');
audiorouter.post('/audiourl',jwtauth, async (req, res) => {
    const { url, userid, transcripts , speakers,highlights } = req.body;
    try {
      const user = await User.findById(userid);
      if (!user) {
        return res.status(400).json({ msg: 'User not found' });
      }
  
      const newAudio = new Audio({
        userId: user._id,
        audioUrl: url,
        transcripts:transcripts,
        speakers:speakers,
        highlights:highlights,
        uploadedDate: new Date()
      });
  
      await newAudio.save();
      res.status(200).json({ msg: 'Audio URL saved successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  audiorouter.get('/audiourl/:id', jwtauth ,async (req, res) => {
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
  module.exports = audiorouter;  