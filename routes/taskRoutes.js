const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get tasks for a project
router.get('/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  
  const query = `
    SELECT t.*, u.name as assigned_name
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = ?
    ORDER BY 
      CASE t.priority 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      t.due_date ASC
  `;
  
  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(results);
  });
});

// Update task status
router.patch('/:taskId/status', (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  
  const completed_at = status === 'completed' ? new Date() : null;
  
  const query = 'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?';
  
  db.query(query, [status, completed_at, taskId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update task' });
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// Get overdue tasks for a project
router.get('/project/:projectId/overdue', (req, res) => {
  const { projectId } = req.params;
  
  const query = `
    SELECT COUNT(*) as overdue_count
    FROM tasks 
    WHERE project_id = ? 
    AND due_date < CURDATE() 
    AND status != 'completed'
  `;
  
  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch overdue tasks' });
    }
    res.json(results[0]);
  });
});

module.exports = router;