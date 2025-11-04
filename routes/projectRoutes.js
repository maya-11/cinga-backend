const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all projects for manager
router.get('/manager/:managerId', (req, res) => {
  const { managerId } = req.params;
  
  const query = `
    SELECT p.*, 
           u.name as client_name,
           u.email as client_email,
           (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
           (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks,
           (SELECT SUM(amount) FROM payments pay WHERE pay.project_id = p.id AND pay.status = 'completed') as total_paid
    FROM projects p
    JOIN users u ON p.client_id = u.id
    WHERE p.manager_id = ?
    ORDER BY p.created_at DESC
  `;
  
  db.query(query, [managerId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    res.json(results);
  });
});

// Get projects for client
router.get('/client/:clientId', (req, res) => {
  const { clientId } = req.params;
  
  const query = `
    SELECT p.*, 
           u.name as manager_name,
           u.email as manager_email,
           (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
           (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks,
           (SELECT SUM(amount) FROM payments pay WHERE pay.project_id = p.id AND pay.status = 'completed') as total_paid
    FROM projects p
    JOIN users u ON p.manager_id = u.id
    WHERE p.client_id = ?
    ORDER BY p.created_at DESC
  `;
  
  db.query(query, [clientId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    res.json(results);
  });
});

// Get single project details
router.get('/:projectId', (req, res) => {
  const { projectId } = req.params;
  
  const query = `
    SELECT p.*, 
           manager.name as manager_name,
           manager.email as manager_email,
           client.name as client_name,
           client.email as client_email
    FROM projects p
    JOIN users manager ON p.manager_id = manager.id
    JOIN users client ON p.client_id = client.id
    WHERE p.id = ?
  `;
  
  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(results[0]);
  });
});

// Update project completion percentage
router.patch('/:projectId/completion', (req, res) => {
  const { projectId } = req.params;
  const { completion_percentage } = req.body;
  
  const query = 'UPDATE projects SET completion_percentage = ? WHERE id = ?';
  
  db.query(query, [completion_percentage, projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update project' });
    }
    res.json({ message: 'Project updated successfully' });
  });
});

// Get project statistics for manager dashboard
router.get('/manager/:managerId/stats', (req, res) => {
  const { managerId } = req.params;
  
  const query = `
    SELECT 
      COUNT(*) as total_projects,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects,
      SUM(total_budget) as total_budget,
      SUM(current_spent) as total_spent,
      AVG(completion_percentage) as avg_completion
    FROM projects 
    WHERE manager_id = ?
  `;
  
  db.query(query, [managerId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    res.json(results[0]);
  });
});

module.exports = router;