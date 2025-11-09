const db = require('../config/db');
const notificationService = require('../services/notificationService');

const notificationController = {
  // Get notifications for user
  getUserNotifications: (req, res) => {
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
  },

  // Mark notification as read
  markNotificationAsRead: (req, res) => {
    const { notificationId } = req.params;

    const query = 'UPDATE notifications SET is_read = true WHERE id = ?';

    db.query(query, [notificationId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update notification' });
      }
      res.json({ message: 'Notification marked as read' });
    });
  },

  // Create notification (internal use)
  createNotification: (req, res) => {
    const { user_id, title, message, type } = req.body;

    const query = `
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (UUID(), ?, ?, ?, ?)
    `;

    db.query(query, [user_id, title, message, type], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create notification' });
      }
      res.json({ message: 'Notification created successfully' });
    });
  },

  // Get unread notifications count
  getUnreadCount: (req, res) => {
    const { userId } = req.params;

    notificationService.getUnreadCount(userId)
      .then(count => {
        res.json({ count });
      })
      .catch(err => {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to fetch unread count' });
      });
  }
};

module.exports = notificationController;