const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Payment = require('../models/Payment');

// Manager dashboard data
router.get('/manager/:managerId', authenticateToken, (req, res) => {
  const { managerId } = req.params;

  // Get project stats
  Project.getManagerStats(managerId, (err, projectStats) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }

    // Get overdue tasks
    Task.getOverdueTasks(managerId, (err, overdueTasks) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch dashboard data' });
      }

      // Get recent projects
      Project.getManagerProjects(managerId, (err, recentProjects) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch dashboard data' });
        }

        res.json({
          stats: projectStats[0],
          overdueTasks: overdueTasks.length,
          recentProjects: recentProjects.slice(0, 5),
          totalTasks: recentProjects.reduce((sum, p) => sum + (p.total_tasks || 0), 0),
          completedTasks: recentProjects.reduce((sum, p) => sum + (p.completed_tasks || 0), 0)
        });
      });
    });
  });
});

// Client dashboard data
router.get('/client/:clientId', authenticateToken, (req, res) => {
  const { clientId } = req.params;

  Project.getClientProjects(clientId, (err, projects) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }

    const activeProject = projects.find(p => p.status === 'active');
    const totalSpent = projects.reduce((sum, p) => sum + (p.total_paid || 0), 0);

    res.json({
      activeProject: activeProject || null,
      totalProjects: projects.length,
      totalSpent,
      recentProjects: projects.slice(0, 3)
    });
  });
});

module.exports = router;