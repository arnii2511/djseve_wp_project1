const mongoose = require('mongoose');

const EventRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: Date,
  time: String,
  venue: String,
  category: String,
  image: String,
  registrationNote: String,
  timeline: [
    {
      time: String,
      activity: String,
    }
  ],
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  statusLogs: [
    {
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      at: { type: Date },
      note: String,
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EventRequest', EventRequestSchema);
