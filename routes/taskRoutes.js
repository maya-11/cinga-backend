const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all tasks for a project
router.get('/project/:projectId', authenticateToken, (req, res) => {
  const { projectId } = req.params;

  Task.getByProject(projectId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(results);
  });
});

// Create new task
router.post('/', authenticateToken, (req, res) => {
  const taskData = req.body;

  Task.create(taskData, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create task' });
    }
    res.json({ message: 'Task created successfully', taskId: taskData.id });
  });
});

// Update task status
router.patch('/:taskId/status', authenticateToken, (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  Task.updateStatus(taskId, status, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update task' });
    }
    res.json({ message: 'Task status updated successfully' });
  });
});

// Get overdue tasks for manager
router.get('/manager/:managerId/overdue', authenticateToken, (req, res) => {
  const { managerId } = req.params;

  Task.getOverdueTasks(managerId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch overdue tasks' });
    }
    res.json(results);
  });
});

module.exports = router;