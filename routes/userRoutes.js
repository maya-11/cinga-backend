const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create or update user from Firebase
router.post('/sync-firebase-user', (req, res) => {
  const { firebase_uid, email, name, role } = req.body;
  
  const query = `
    INSERT INTO users (firebase_uid, email, name, role) 
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    email = VALUES(email), 
    name = VALUES(name), 
    role = VALUES(role)
  `;
  
  db.query(query, [firebase_uid, email, name, role], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to sync user' });
    }
    
    // Get the user data
    db.query('SELECT * FROM users WHERE firebase_uid = ?', [firebase_uid], (err, userResults) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      res.json(userResults[0]);
    });
  });
});

// Get user by Firebase UID
router.get('/firebase/:firebaseUid', (req, res) => {
  const { firebaseUid } = req.params;
  
  const query = 'SELECT * FROM users WHERE firebase_uid = ?';
  
  db.query(query, [firebaseUid], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

module.exports = router;