const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const Project = require('../models/Project');
const Tasks = require('../models/Task'); // CHANGED: Using 'Tasks' instead of 'Task'
const Payment = require('../models/Payment');
const User = require('../models/User');
const db = require('../config/db');

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
    Tasks.getOverdueTasks(managerId, (err, overdueTasks) => {
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

// Client dashboard data using Firebase UID
router.get('/client/:firebaseUid', authenticateToken, (req, res) => {
  const { firebaseUid } = req.params;
  console.log('🔍 Dashboard: Loading client dashboard for:', firebaseUid);
  
  // First, get the user ID from firebase_uid
  User.findByFirebaseUid(firebaseUid, (err, userResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to find user' });
    }
    
    if (userResults.length === 0) {
      console.log('❌ No user found with firebase_uid:', firebaseUid);
      return res.status(404).json({ error: 'User not found in database' });
    }
    
    const userId = userResults[0].id;
    const userName = userResults[0].name;
    console.log('✅ Found user ID:', userId, 'Name:', userName);
    
    // Get client dashboard stats
    Project.getClientDashboardStats(userId, (err, statsResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
      }
      
      // Get upcoming deadlines
      Project.getClientUpcomingDeadlines(userId, (err, deadlinesResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch deadlines' });
        }
        
        const dashboardData = {
          stats: statsResults[0] || {
            total_projects: 0,
            active_projects: 0,
            completed_projects: 0,
            total_investment: 0
          },
          upcomingDeadlines: deadlinesResults || []
        };
        
        console.log('✅ Dashboard data sent:', {
          total_projects: dashboardData.stats.total_projects,
          active_projects: dashboardData.stats.active_projects,
          deadlines: dashboardData.upcomingDeadlines.length
        });
        res.json(dashboardData);
      });
    });
  });
});

// Client dashboard data using internal client ID (existing route)
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