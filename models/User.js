const db = require('../config/db');

class User {
  static create(userData, callback) {
    const query = 'INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)';
    const values = [userData.id, userData.email, userData.name, userData.role];
    db.query(query, values, callback);
  }

  static findById(id, callback) {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], callback);
  }

  static findByEmail(email, callback) {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  }

  static getClients(callback) {
    const query = 'SELECT id, name, email FROM users WHERE role = "client"';
    db.query(query, callback);
  }
}

module.exports = User;