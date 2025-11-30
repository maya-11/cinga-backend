const User = require('../models/User');
const db = require('../config/db');

const userController = {
  // Get user profile
  getUserProfile: (req, res) => {
    const { userId } = req.params;

    User.findById(userId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive data
      const user = results[0];
      delete user.created_at;
      
      res.json(user);
    });
  },

  // Get all clients (for manager to assign projects)
  getAllClients: (req, res) => {
    User.getClients((err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch clients' });
      }
      res.json(results);
    });
  },

  // Update user profile
  updateUserProfile: (req, res) => {
    const { userId } = req.params;
    const { name } = req.body;

    const query = 'UPDATE users SET name = ? WHERE id = ?';
    
    db.query(query, [name, userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update user' });
      }
      res.json({ message: 'User updated successfully' });
    });
  }
};

module.exports = userController;

