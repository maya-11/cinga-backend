const express = require('express');
const router = express.Router();
const Manager = require('../models/Manager');

// Get manager profile by Firebase UID
router.get('/profile/:firebaseUid', (req, res) => {
  const { firebaseUid } = req.params;

  Manager.findByFirebaseUid(firebaseUid, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch manager profile' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    res.json(results[0]);
  });
});

// Get manager dashboard data
router.get('/dashboard/:firebaseUid', (req, res) => {
  const { firebaseUid } = req.params;

  // First get manager ID
  Manager.findByFirebaseUid(firebaseUid, (err, managerResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch manager data' });
    }

    if (managerResults.length === 0) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const managerId = managerResults[0].id;

    // Get manager stats
    Manager.getManagerStats(managerId, (err, statsResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch dashboard data' });
      }

      // Get overdue tasks
      Manager.getOverdueTasks(managerId, (err, overdueResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch tasks data' });
        }

        // Get manager projects
        Manager.getManagerProjects(managerId, (err, projectsResults) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch projects data' });
          }

          res.json({
            manager: managerResults[0],
            stats: statsResults[0] || {
              total_projects: 0,
              completed_projects: 0,
              active_projects: 0,
              total_budget: 0,
              avg_completion: 0
            },
            recentProjects: projectsResults.slice(0, 5) || [],
            overdueTasks: overdueResults[0]?.overdue_tasks || 0
          });
        });
      });
    });
  });
});

// Get manager projects
router.get('/projects/:firebaseUid', (req, res) => {
  const { firebaseUid } = req.params;

  Manager.findByFirebaseUid(firebaseUid, (err, managerResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch manager data' });
    }

    if (managerResults.length === 0) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const managerId = managerResults[0].id;

    Manager.getManagerProjects(managerId, (err, projectsResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch projects data' });
      }

      res.json(projectsResults);
    });
  });
});

// NEW: Get archived projects for manager
router.get('/projects/:firebaseUid/archived', (req, res) => {
  const { firebaseUid } = req.params;

  Manager.findByFirebaseUid(firebaseUid, (err, managerResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch manager data' });
    }

    if (managerResults.length === 0) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const managerId = managerResults[0].id;

    Manager.getArchivedManagerProjects(managerId, (err, projectsResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch archived projects' });
      }

      res.json(projectsResults);
    });
  });
});

module.exports = router;