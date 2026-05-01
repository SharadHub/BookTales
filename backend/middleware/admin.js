const admin = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  
  if (req.user.role !== 'admin' && req.user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = admin;
