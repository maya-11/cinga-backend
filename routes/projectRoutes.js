const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const MockTrelloService = require('../services/mockTrelloService'); // Use mock instead of real
const { authenticateToken } = require('../middleware/authMiddleware');

// Create new project with mock Trello board
router.post('/', authenticateToken, async (req, res) => {
  const projectData = req.body;

  try {
    console.log('🚀 Creating project with mock Trello integration...');
    
    // Create mock Trello board for the project
    const trelloResult = await MockTrelloService.createProjectBoard(
      projectData.name, 
      projectData.description
    );

    if (trelloResult.success) {
      projectData.trello_board_id = trelloResult.boardId;
      console.log('✅ Mock Trello board assigned:', trelloResult.boardId);
    }

    // Create project in database
    Project.create(projectData, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create project' });
      }

      res.json({ 
        message: 'Project created successfully', 
        projectId: projectData.id,
        trelloBoard: trelloResult.success ? {
          boardId: trelloResult.boardId,
          boardUrl: trelloResult.boardUrl,
          mock: true, // Indicate this is mock data
          message: 'Trello integration is running in mock mode'
        } : null
      });
    });

  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get all projects for a manager
router.get('/manager/:managerId', authenticateToken, (req, res) => {
  const { managerId } = req.params;

  Project.getByManager(managerId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    res.json(results);
  });
});

// Get all projects for a client
router.get('/client/:clientId', authenticateToken, (req, res) => {
  const { clientId } = req.params;

  Project.getByClient(clientId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    res.json(results);
  });
});

// Get project details
router.get('/:projectId', authenticateToken, (req, res) => {
  const { projectId } = req.params;

  Project.findById(projectId, (err, results) => {
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
router.patch('/:projectId/completion', authenticateToken, (req, res) => {
  const { projectId } = req.params;
  const { completion_percentage } = req.body;

  Project.updateCompletion(projectId, completion_percentage, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update project' });
    }
    res.json({ message: 'Project progress updated successfully' });
  });
});

// Sync project progress with mock Trello
router.post('/:projectId/sync-trello', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  console.log('🔄 Syncing project with mock Trello...');

  // First get project to check if it has Trello board
  Project.findById(projectId, async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = results[0];
    
    // If no Trello board, create one automatically
    if (!project.trello_board_id) {
      console.log('📋 No Trello board found, creating mock board...');
      const trelloResult = await MockTrelloService.createProjectBoard(project.name, project.description);
      
      if (trelloResult.success) {
        // Update project with new board ID
        Project.updateTrelloBoardId(projectId, trelloResult.boardId, (err, updateResults) => {
          if (err) {
            console.error('Failed to update project with board ID:', err);
          }
        });
      }
    }

    try {
      const boardId = project.trello_board_id;
      const syncResult = await MockTrelloService.syncProjectProgress(boardId);
      
      if (syncResult.success) {
        // Update project completion percentage
        Project.updateCompletion(projectId, syncResult.progress, (err, updateResults) => {
          if (err) {
            console.error('Database update error:', err);
          }
        });

        console.log('✅ Mock Trello sync completed successfully');
        
        res.json({
          success: true,
          progress: syncResult.progress,
          totalTasks: syncResult.totalTasks,
          completedTasks: syncResult.completedTasks,
          overdueTasks: syncResult.overdueTasks,
          mock: true,
          message: 'Trello sync running in mock mode'
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to sync with mock Trello',
          details: syncResult.error,
          mock: true
        });
      }

    } catch (error) {
      console.error('Mock Trello sync error:', error);
      res.status(500).json({ 
        error: 'Failed to sync with mock Trello',
        mock: true 
      });
    }
  });
});

// Get manager project statistics
router.get('/manager/:managerId/stats', authenticateToken, (req, res) => {
  const { managerId } = req.params;

  Project.getManagerStats(managerId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    res.json(results[0] || {});
  });
});

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


module.exports = router;