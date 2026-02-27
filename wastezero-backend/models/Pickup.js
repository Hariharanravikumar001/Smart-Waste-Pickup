const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  volunteerId: {
    type: String
  },
  wasteType: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pickup', PickupSchema);
