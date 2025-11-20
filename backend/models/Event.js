const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  time: { type: String },
  venue: { type: String },
  category: { type: String },
  image: { type: String },
  registrationNote: { type: String },
  timeline: [
    {
      time: String,
      activity: String,
    }
  ],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', EventSchema);
