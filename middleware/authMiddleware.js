const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Melindungi rute, hanya untuk user yang sudah login
exports.protect = async (req, res, next) => {
  let token;

  // Cek header 'Authorization' untuk Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Atau, cek cookie untuk token
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Pastikan token ada
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Dapatkan data user dari token dan pasang ke object req
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Memberikan akses berdasarkan role (contoh: hanya untuk 'admin')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};