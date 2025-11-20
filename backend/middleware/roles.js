exports.isAdmin = (req, res, next) => {
  const role = req.user && req.user.role ? String(req.user.role).toLowerCase() : '';
  if (role === 'admin') return next();
  return res.status(403).json({ message: 'Admin resource. Access denied.' });
};

exports.isCommittee = (req, res, next) => {
  const role = req.user && req.user.role ? String(req.user.role).toLowerCase() : '';
  if (role === 'committee') return next();
  return res.status(403).json({ message: 'Committee resource. Access denied.' });
};

exports.isUser = (req, res, next) => {
  const role = req.user && req.user.role ? String(req.user.role).toLowerCase() : '';
  if (role === 'user') return next();
  return res.status(403).json({ message: 'User resource. Access denied.' });
};
