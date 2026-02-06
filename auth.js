const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to verify specific role
const verifyRole = (roles) => (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.admin && roles.includes(req.admin.role)) {
      next();
    } else {
      return res.status(403).json({ message: `Access denied. ${roles.join(' or ')} only.` });
    }
  });
};

const verifyAdmin = verifyRole(['admin', 'superadmin']);
const verifyEmployee = verifyRole(['admin', 'superadmin', 'employee']);

module.exports = { verifyToken, verifyAdmin, verifyEmployee, verifyRole, JWT_SECRET };
