const Project = require('../models/Project');
const MockTrelloService = require('../services/mockTrelloService');

const projectController = {
  // Get all projects for manager
  getManagerProjects: (req, res) => {
    const { managerId } = req.params;

    Project.getManagerProjects(managerId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }
      res.json(results);
    });
  },

  // Get projects for client
  getClientProjects: (req, res) => {
    const { clientId } = req.params;

    Project.getClientProjects(clientId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }
      res.json(results);
    });
  },

  // Get single project details
  getProjectById: (req, res) => {
    const { projectId } = req.params;

    Project.getById(projectId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch project' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(results[0]);
    });
  },

  // Create new project with mock Trello board
  createProject: async (req, res) => {
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
            mock: true,
            message: 'Trello integration is running in mock mode'
          } : null
        });
      });

    } catch (error) {
      console.error('Project creation error:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  },

  // Update project completion percentage
  updateProjectCompletion: (req, res) => {
    const { projectId } = req.params;
    const { completion_percentage } = req.body;

    Project.updateCompletion(projectId, completion_percentage, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update project' });
      }
      res.json({ message: 'Project updated successfully' });
    });
  },

  // Sync project progress with mock Trello
  syncTrelloProgress: async (req, res) => {
    const { projectId } = req.params;

    console.log('🔄 Syncing project with mock Trello...');

    // First get project to check if it has Trello board
    Project.getById(projectId, async (err, results) => {
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
          Project.updateCompletion(projectId, 0, (err, updateResults) => {
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
  },

  // Get project statistics for manager dashboard
  getManagerStats: (req, res) => {
    const { managerId } = req.params;

    Project.getManagerStats(managerId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
      res.json(results[0]);
    });
  }
};

module.exports = projectController;