const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const rawRole = req.body.role;
    const role = rawRole ? rawRole.toString().trim() : '';
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });

    // normalize to Title Case for storage (e.g., 'Admin', 'Committee', 'User')
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    // role-specific server-side validation (case-insensitive)
    if (normalizedRole.toLowerCase() === 'admin') {
      const provided = (req.body.adminCode || '').toString().trim();
      const secret = (process.env.ADMIN_CODE || '').toString().trim();
      if (!provided) return res.status(400).json({ message: 'Admin code is required' });
      if (secret && provided !== secret) return res.status(400).json({ message: 'Invalid admin code — ensure there are no leading/trailing spaces and that casing matches the server admin code.' });
    }
    if (normalizedRole.toLowerCase() === 'committee') {
      if (!req.body.committeeName || !req.body.department || !req.body.idProof) return res.status(400).json({ message: 'Committee details are required' });
    }
    if (normalizedRole.toLowerCase() === 'user') {
      if (!req.body.course || !req.body.year) return res.status(400).json({ message: 'User profile (course/year) is required' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashed,
      phone,
      role: normalizedRole,
    });

    // role-specific
    if (normalizedRole.toLowerCase() === 'admin' && req.body.adminCode) newUser.adminCode = req.body.adminCode.toString().trim();
    if (normalizedRole.toLowerCase() === 'committee') {
      newUser.committee = {
        committeeName: req.body.committeeName,
        department: req.body.department,
        idProof: req.body.idProof,
      };
    }
    if (normalizedRole.toLowerCase() === 'user') {
      newUser.userProfile = { course: req.body.course, year: req.body.year };
    }

    await newUser.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // allow case-insensitive role check
    if (String(user.role).toLowerCase() !== String(role).toLowerCase()) return res.status(400).json({ message: `Invalid role for this account` });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
