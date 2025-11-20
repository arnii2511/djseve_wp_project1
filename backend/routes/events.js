const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const { isAdmin, isCommittee } = require('../middleware/roles');
const eventController = require('../controllers/eventController');
const EventRequest = require('../models/EventRequest');

// POST routes
router.post('/', auth, isAdmin, eventController.createEvent);
router.post('/request', auth, isCommittee, eventController.requestEvent);

// GET routes - specific routes first
router.get('/', eventController.getApprovedEvents);
router.get('/all', auth, eventController.getAllEvents);
router.get('/request/:id', auth, eventController.getRequestById);
// Debugging endpoint: returns authenticated user info and request counts
router.get('/debug/me', auth, async (req, res) => {
	try {
		const totalRequests = await EventRequest.countDocuments();
		const myRequests = await EventRequest.find({ requestedBy: req.user._id }).lean();
		return res.json({ user: req.user, totalRequests, myRequestsCount: myRequests.length, myRequests });
	} catch (err) {
		console.error('Debug error', err);
		return res.status(500).json({ message: 'Debug error' });
	}
});
// Parameterized routes last - optional auth for event details (allows viewing approved events without login)
router.get('/:id', optionalAuth, eventController.getEventById);

// PUT routes - specific routes first
router.put('/request/:id', auth, isCommittee, eventController.updateRequest);
router.put('/approve/:id', auth, isAdmin, eventController.approveRequest);
router.put('/reject/:id', auth, isAdmin, eventController.rejectRequest);
// Parameterized routes last
router.put('/:id', auth, isAdmin, eventController.updateEvent);

// DELETE routes
router.delete('/:id', auth, isAdmin, eventController.deleteEvent);

module.exports = router;
