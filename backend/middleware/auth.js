const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader); // Debug log
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token found'); // Debug log
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    console.log('Decoded token:', decoded); // Debug log
    
    req.userId = decoded.userId || decoded.id || decoded._id; // Try different field names
    req.userRole = decoded.role;
    
    console.log('Set userId:', req.userId); // Debug log
    next();
  } catch (error) {
    console.error('Auth middleware error:', error); // Debug log
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };