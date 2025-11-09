const admin = require('../config/firebase-admin');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  admin.auth().verifyIdToken(token)
    .then((decodedToken) => {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      next();
    })
    .catch((error) => {
      console.error('Auth error:', error);
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    });
};

module.exports = { authenticateToken };