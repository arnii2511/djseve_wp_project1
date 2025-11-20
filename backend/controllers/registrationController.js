const Registration = require('../models/Registration');
const Event = require('../models/Event');

exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const ev = await Event.findById(eventId);
    if (!ev || ev.status !== 'Approved') return res.status(400).json({ message: 'Event not available' });

    // Prevent duplicate
    const already = await Registration.findOne({ userId: req.user._id, eventId });
    if (already) return res.status(400).json({ message: 'Already registered' });

    const reg = new Registration({ userId: req.user._id, eventId });
    await reg.save();
    res.status(201).json(reg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ userId: req.user._id }).populate('eventId');
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
