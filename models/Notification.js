// models/Notification.js
const db = require('../config/db');

class Notification {
  static create(notificationData, callback) {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, related_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      notificationData.user_id,
      notificationData.title,
      notificationData.message,
      notificationData.type,
      notificationData.related_id,
      notificationData.created_at
    ];
    db.query(query, values, callback);
  }

  static getByUserId(userId, callback) {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
      LIMIT 50
    `;
    db.query(query, [userId], callback);
  }

  static markAsRead(notificationId, callback) {
    const query = 'UPDATE notifications SET read = true WHERE id = ?';
    db.query(query, [notificationId], callback);
  }

  static delete(notificationId, callback) {
    const query = 'DELETE FROM notifications WHERE id = ?';
    db.query(query, [notificationId], callback);
  }
}

module.exports = Notification;