const express = require('express');
const router = express.Router();
const admin = require('../config/firebase-admin');
const pool = require('../config/db');

// Login/Register user
router.post('/login', async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // Check if user exists in database
    const [rows] = await pool.promise().query(
      'SELECT * FROM users WHERE firebase_uid = ?',
      [uid]
    );

    let user;
    let isNewUser = false;

    if (!rows.length) {
      // User doesn't exist → create in DB
      const role = email.includes('manager') ? 'manager' : 'client';
      const [result] = await pool.promise().query(
        'INSERT INTO users (name, email, role, firebase_uid) VALUES (?, ?, ?, ?)',
        [name || email.split('@')[0], email, role, uid]
      );

      user = {
        id: result.insertId, // numeric DB ID
        email,
        name: name || email.split('@')[0],
        role
      };
      isNewUser = true;
    } else {
      // User exists
      user = {
        id: rows[0].id,
        email: rows[0].email,
        name: rows[0].name,
        role: rows[0].role
      };
    }

    res.json({ user, isNewUser });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed. Invalid token.' });
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
