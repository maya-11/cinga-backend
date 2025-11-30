// routes/taskRoutes.js - COMPLETELY FIXED
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all tasks for a project
router.get('/project/:projectId', authenticateToken, taskController.getProjectTasks);

// Get single task by ID
router.get('/:taskId', authenticateToken, taskController.getTaskById);

// Get all tasks for a manager
router.get('/manager/:managerId/tasks', authenticateToken, taskController.getManagerTasks);

// Create new task
router.post('/', authenticateToken, taskController.createTask);

// Update task status
router.patch('/:taskId/status', authenticateToken, taskController.updateTaskStatus);

// Update task (full update)
router.put('/:taskId', authenticateToken, taskController.updateTask);

// CLIENT: Update task status with notes
router.patch('/:taskId/client-update', authenticateToken, taskController.updateTaskStatusAndNotes);

// Delete task
router.delete('/:taskId', authenticateToken, taskController.deleteTask);

module.exports = router;