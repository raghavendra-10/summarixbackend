const mongoose = require('mongoose');

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
  transcripts: { 
    type: Object,
    required: false
  },
  speakers: { 
    type: Object,
    required: false
  },
  highlights: { 
    type: Object,
    required: false
  },
  uploadedDate: { 
    type: Date, 
    default: Date.now 
  }
});

const Audio = mongoose.model('Audio', audioSchema);
module.exports = Audio;