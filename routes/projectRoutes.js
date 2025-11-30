const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/authMiddleware');
const db = require('../config/db');
const projectController = require('../controllers/projectController');

// Create new project WITHOUT Trello
router.post('/', authenticateToken, projectController.createProject);

// Get all projects for a manager
router.get('/manager/:managerId', authenticateToken, projectController.getManagerProjects);

// Get client projects using Firebase UID - USE CONTROLLER METHOD
router.get('/client/:firebaseUid', authenticateToken, (req, res) => {
  const { firebaseUid } = req.params;
  console.log('🔍 Projects: Loading client projects for Firebase UID:', firebaseUid);
  
  // First, get the user ID from firebase_uid
  User.findByFirebaseUid(firebaseUid, (err, userResults) => {
    if (err) {
      console.error('❌ Database error in findByFirebaseUid:', err);
      return res.status(500).json({ error: 'Failed to find user' });
    }
    
    if (userResults.length === 0) {
      console.log('❌ No user found with firebase_uid:', firebaseUid);
      return res.status(404).json({ error: 'User not found in database' });
    }
    
    const userId = userResults[0].id;
    console.log('✅ Found user ID for projects:', userId);
    
    // ✅ USE THE CONTROLLER METHOD instead of calling model directly
    // Create a mock request object for the controller
    const mockReq = {
      params: { clientId: userId },
      user: req.user
    };
    
    const mockRes = {
      json: (data) => res.json(data),
      status: (code) => ({
        json: (data) => res.status(code).json(data)
      })
    };
    
    projectController.getClientProjects(mockReq, mockRes);
  });
});

// Get all projects for a client using internal client ID
router.get('/client/:clientId', authenticateToken, projectController.getClientProjects);

// Get project details
router.get('/:projectId', authenticateToken, projectController.getProjectById);

// 🆕 ADD: Update Project Route
router.put('/:projectId/update', authenticateToken, projectController.updateProject);

// 🆕 ADD: Delete Project Route (Hard Delete)
router.delete('/:projectId/delete', authenticateToken, projectController.deleteProject);

// Update project completion percentage
router.patch('/:projectId/completion', authenticateToken, projectController.updateProjectCompletion);

// CLIENT: Update project progress
router.patch('/:projectId/progress', authenticateToken, projectController.updateProjectProgress);

// MANAGER: Update project details
router.put('/:projectId', authenticateToken, projectController.managerUpdateProject);

// Get manager project statistics
router.get('/manager/:managerId/stats', authenticateToken, projectController.getManagerStats);

// Update project status
router.patch('/:projectId/status', authenticateToken, (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;

  const query = 'UPDATE projects SET status = ? WHERE id = ?';
  
  db.query(query, [status, projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update project status' });
    }
    res.json({ message: 'Project status updated successfully' });
  });
});

// Delete project
router.delete('/:projectId', authenticateToken, (req, res) => {
  const { projectId } = req.params;

  const query = 'DELETE FROM projects WHERE id = ?';
  
  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete project' });
    }
    res.json({ message: 'Project deleted successfully' });
  });
});

// Get all projects (for admin)
router.get('/', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM projects ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    res.json(results);
  });
});

// ARCHIVE PROJECT ROUTES
router.patch('/:projectId/archive', authenticateToken, projectController.archiveProject);
router.patch('/:projectId/unarchive', authenticateToken, projectController.unarchiveProject);
router.get('/manager/:managerId/archived', authenticateToken, projectController.getArchivedManagerProjects);

module.exports = router;