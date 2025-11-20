const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const userController = require('../controllers/userController');

router.get('/', auth, isAdmin, userController.getUsers);
router.get('/profile', auth, userController.getProfile);

module.exports = router;
