const Event = require('../models/Event');
const EventRequest = require('../models/EventRequest');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, category, image, timeline, registrationNote } = req.body;
    const event = new Event({ title, description, date, time, venue, category, image, registrationNote, timeline, status: 'Approved', createdBy: req.user._id });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requestEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, category, image, timeline, registrationNote } = req.body;
    const reqEvent = new EventRequest({ title, description, date, time, venue, category, image, registrationNote, timeline, requestedBy: req.user._id });
    // add initial status log
    reqEvent.statusLogs = [{ status: 'Pending', by: req.user._id, at: new Date(), note: 'Requested' }];
    await reqEvent.save();
    res.status(201).json(reqEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'Approved' }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      return res.status(400).json({ message: 'Event ID is required' });
    }
    
    const event = await Event.findById(eventId).populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Only return approved events to non-admin users
    if (event.status !== 'Approved') {
      // Check if user is authenticated and is admin
      const role = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : null;
      if (role !== 'admin') {
        return res.status(403).json({ message: 'Event not available' });
      }
    }
    
    res.json(event);
  } catch (err) {
    console.error('Error in getEventById:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    let requests = [];
    // if user is admin, return all requests; if committee, return only their requests
    const role = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : null;
    if (role === 'admin') {
      requests = await EventRequest.find()
        .populate('requestedBy', 'name email')
        .populate('statusLogs.by', 'name email')
        .sort({ createdAt: -1 }); // Sort by newest first
    } else if (role === 'committee') {
      requests = await EventRequest.find({ requestedBy: req.user._id })
        .populate('requestedBy', 'name email')
        .populate('statusLogs.by', 'name email')
        .sort({ createdAt: -1 }); // Sort by newest first
    }
    res.json({ events, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const reqEv = await EventRequest.findById(req.params.id).populate('requestedBy', 'name email').populate('statusLogs.by', 'name email');
    if (!reqEv) return res.status(404).json({ message: 'Request not found' });
    // only admin or requesting committee can fetch
    const rrole = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : null;
    if (rrole === 'committee' && String(reqEv.requestedBy._id) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized' });
    res.json(reqEv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const reqEv = await EventRequest.findById(req.params.id);
    if (!reqEv) return res.status(404).json({ message: 'Request not found' });
    
    // Check if already approved and event exists
    if (reqEv.status === 'Approved') {
      // Check if event already exists for this request
      const existingEvent = await Event.findOne({ 
        title: reqEv.title, 
        date: reqEv.date,
        createdBy: reqEv.requestedBy 
      });
      if (existingEvent) {
        return res.status(400).json({ message: 'Request already approved and event exists', event: existingEvent, request: reqEv });
      }
    }
    
    reqEv.status = 'Approved';
    reqEv.statusLogs = reqEv.statusLogs || [];
    reqEv.statusLogs.push({ status: 'Approved', by: req.user._id, at: new Date(), note: req.body.note || 'Approved by admin' });
    await reqEv.save();

    // Check if event already exists before creating
    let event = await Event.findOne({ 
      title: reqEv.title, 
      date: reqEv.date,
      createdBy: reqEv.requestedBy 
    });
    
    if (!event) {
      // create actual event
      event = new Event({
        title: reqEv.title,
        description: reqEv.description,
        date: reqEv.date,
        time: reqEv.time,
        venue: reqEv.venue,
        category: reqEv.category,
        image: reqEv.image,
        timeline: reqEv.timeline || [],
        registrationNote: reqEv.registrationNote || '',
        status: 'Approved',
        createdBy: reqEv.requestedBy,
      });
      await event.save();
    }

    res.json({ message: 'Request approved', event, request: reqEv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const reqEv = await EventRequest.findById(req.params.id);
    if (!reqEv) return res.status(404).json({ message: 'Request not found' });
    reqEv.status = 'Rejected';
    reqEv.statusLogs = reqEv.statusLogs || [];
    reqEv.statusLogs.push({ status: 'Rejected', by: req.user._id, at: new Date(), note: req.body.note || 'Rejected by admin' });
    await reqEv.save();
    res.json({ message: 'Request rejected', request: reqEv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const reqEv = await EventRequest.findById(req.params.id);
    if (!reqEv) return res.status(404).json({ message: 'Request not found' });
    // Only the requesting committee can edit and only if pending
    if (String(reqEv.requestedBy) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized' });
    if (reqEv.status !== 'Pending') return res.status(400).json({ message: 'Only pending requests can be edited' });

    const { title, description, date, time, venue, category, image, timeline, registrationNote } = req.body;
    reqEv.title = title ?? reqEv.title;
    reqEv.description = description ?? reqEv.description;
    reqEv.date = date ?? reqEv.date;
    reqEv.time = time ?? reqEv.time;
    reqEv.venue = venue ?? reqEv.venue;
    reqEv.category = category ?? reqEv.category;
    reqEv.image = image ?? reqEv.image;
    reqEv.timeline = timeline ?? reqEv.timeline;
    reqEv.registrationNote = registrationNote ?? reqEv.registrationNote;

    await reqEv.save();
    res.json({ message: 'Request updated', request: reqEv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
