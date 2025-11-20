const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['Admin', 'Committee', 'User'], required: true },
  adminCode: { type: String },
  committee: {
    committeeName: String,
    department: String,
    idProof: String,
  },
  userProfile: {
    course: String,
    year: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
