const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const regController = require('../controllers/registrationController');

router.post('/register', auth, regController.registerForEvent);
router.get('/my', auth, regController.getMyRegistrations);

module.exports = router;
