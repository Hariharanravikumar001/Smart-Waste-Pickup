const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'volunteer', 'admin'],
    default: 'user'
  },
  location: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  resetOtp: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  avatar: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('User', UserSchema);
