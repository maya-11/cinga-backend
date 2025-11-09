const Task = require('../models/Task');
const MockTrelloService = require('../services/mockTrelloService');
const notificationService = require('../services/notificationService');

const taskController = {
  // Get all tasks for a project
  getProjectTasks: (req, res) => {
    const { projectId } = req.params;

    Task.getByProject(projectId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      res.json(results);
    });
  },

  // Create new task
  createTask: async (req, res) => {
    const taskData = req.body;

    Task.create(taskData, async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create task' });
      }

      // If task has Trello integration, create card
      if (taskData.trello_board_id) {
        try {
          await MockTrelloService.createTaskCard(
            taskData.trello_board_id,
            taskData.name,
            taskData.description,
            taskData.due_date
          );
        } catch (trelloError) {
          console.error('Trello card creation failed:', trelloError);
          // Continue even if Trello fails
        }
      }

      // Send notification if task is assigned
      if (taskData.assigned_to) {
        try {
          // In real app, you'd fetch user details here
          await notificationService.notifyTaskAssignment(
            taskData.assigned_to,
            'user@example.com', // Would come from user data
            'Assigned User', // Would come from user data
            taskData.name,
            'Project Name', // Would come from project data
            taskData.due_date
          );
        } catch (notificationError) {
          console.error('Notification failed:', notificationError);
        }
      }

      res.json({ message: 'Task created successfully', taskId: taskData.id });
    });
  },

  // Update task status
  updateTaskStatus: async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    Task.updateStatus(taskId, status, async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update task' });
      }

      // If task has Trello card, update it
      // In real app, you'd fetch the trello_card_id from database
      if (req.body.trello_card_id) {
        try {
          await MockTrelloService.updateTaskStatus(req.body.trello_card_id, status);
        } catch (trelloError) {
          console.error('Trello update failed:', trelloError);
        }
      }

      res.json({ message: 'Task status updated successfully' });
    });
  },

  // Get overdue tasks for manager
  getOverdueTasks: (req, res) => {
    const { managerId } = req.params;

    Task.getOverdueTasks(managerId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch overdue tasks' });
      }
      res.json(results);
    });
  }
};

module.exports = taskController;