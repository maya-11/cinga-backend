const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Test all tables
router.get('/database', (req, res) => {
  const tables = ['users', 'projects', 'tasks', 'payments', 'notifications'];
  const results = {};
  let completed = 0;

  tables.forEach(table => {
    db.query(`SELECT COUNT(*) as count FROM ${table}`, (err, result) => {
      if (err) {
        results[table] = { error: err.message };
      } else {
        results[table] = { count: result[0].count };
      }
      
      completed++;
      if (completed === tables.length) {
        res.json({
          message: 'Database connection test',
          database: process.env.DB_NAME,
          tables: results
        });
      }
    });
  });
});

// Test specific data retrieval
router.get('/sample-data', (req, res) => {
  const query = `
    SELECT 
      p.title as project_title,
      p.completion_percentage,
      m.name as manager_name,
      c.name as client_name,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks
    FROM projects p
    JOIN users m ON p.manager_id = m.id
    JOIN users c ON p.client_id = c.id
    LIMIT 3
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: 'Sample project data',
      projects: results
    });
  });
});

module.exports = router;