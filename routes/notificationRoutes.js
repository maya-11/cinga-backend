const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get notifications for user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC
    LIMIT 50
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    res.json(results);
  });
});

// Mark notification as read
router.patch('/:notificationId/read', (req, res) => {
  const { notificationId } = req.params;
  
  const query = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';
  
  db.query(query, [notificationId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update notification' });
    }
    res.json({ message: 'Notification marked as read' });
  });
});

// Create new notification
router.post('/', (req, res) => {
  const { user_id, title, message, type = 'info', related_entity_type = 'system', related_entity_id = null } = req.body;
  
  const query = `
    INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [user_id, title, message, type, related_entity_type, related_entity_id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create notification' });
    }
    res.json({ message: 'Notification created successfully', notificationId: results.insertId });
  });
});

module.exports = router;