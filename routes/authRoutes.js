const express = require('express');
const router = express.Router();
const admin = require('../config/firebase-admin');
const User = require('../models/User');

// Login/Register user
router.post('/login', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // Check if user exists in our database
    User.findById(uid, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      let user = results[0];

      // If user doesn't exist, create them
      if (!user) {
        const role = email.includes('manager') ? 'manager' : 'client';
        const userData = {
          id: uid,
          email,
          name: name || email.split('@')[0],
          role
        };

        User.create(userData, (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Return the new user
          res.json({
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role
            },
            isNewUser: true
          });
        });
      } else {
        // Return existing user
        res.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          isNewUser: false
        });
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      error: 'Authentication failed. Invalid token.' 
    });
  }
});

// Verify token (for protected routes)
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({ valid: true, user: decodedToken });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;