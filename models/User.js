const db = require('../config/db'); 

const User = {
  // Find user by ID
  findById: (userId, callback) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [userId], callback);
  },

  // Find user by Firebase UID
  findByFirebaseUid: (firebase_uid, callback) => {
    const query = 'SELECT * FROM users WHERE firebase_uid = ?';
    db.query(query, [firebase_uid], callback);
  },

  // Get all clients
  getClients: (callback) => {
    const query = 'SELECT * FROM users WHERE role = "client"';
    db.query(query, callback);
  },

  // Get all managers  
  getManagers: (callback) => {
    const query = 'SELECT * FROM users WHERE role = "manager"';
    db.query(query, callback);
  },

  // Get all users
  getAll: (callback) => {
    const query = 'SELECT * FROM users';
    db.query(query, callback);
  },

  // Create user
  create: (userData, callback) => {
    const query = 'INSERT INTO users (firebase_uid, email, name, role) VALUES (?, ?, ?, ?)';
    db.query(query, [userData.firebase_uid, userData.email, userData.name, userData.role], callback);
  },

  // Update user profile
  updateProfile: (userId, name, callback) => {
    const query = 'UPDATE users SET name = ? WHERE id = ?';
    db.query(query, [name, userId], callback);
  },

  // Ensure manager exists in database (for Firebase users)
  ensureManagerExists: (firebase_uid, userData, callback) => {
    const query = 'INSERT INTO users (firebase_uid, email, name, role) VALUES (?, ?, ?, "manager") ON DUPLICATE KEY UPDATE email = ?, name = ?';
    db.query(query, [firebase_uid, userData.email, userData.name, userData.email, userData.name], callback);
  }
};

module.exports = User;