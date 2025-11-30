const admin = require('../config/firebase-admin');

const authenticateToken = (req, res, next) => {
  // Check for token in Authorization header OR request body
  const authHeader = req.headers.authorization;
  const tokenFromBody = req.body?.token;
  
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : tokenFromBody;

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }

  console.log('🔐 Auth Middleware - Verifying token...');

  admin.auth().verifyIdToken(token)
    .then((decodedToken) => {
      console.log('✅ Token verified for UID:', decodedToken.uid);
      
      req.user = {
        firebase_uid: decodedToken.uid, // Consistent Firebase UID naming
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0]
      };
      
      console.log('✅ User set in request:', req.user);
      next();
    })
    .catch((error) => {
      console.error('❌ Auth error:', error);
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    });
};

module.exports = { authenticateToken };