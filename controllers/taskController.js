// controllers/taskController.js - COMPLETE FIXED VERSION
const Task = require('../models/Task');

// ✅ DEBUG: Check if Task methods exist
console.log('🔧 Task model methods:', Object.keys(Task));
console.log('🔧 Task.getByProject is function?', typeof Task.getByProject);

const taskController = {
  getProjectTasks: (req, res) => {
    const { projectId } = req.params;
    console.log('📋 GET tasks for project:', projectId);

    if (!projectId) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    Task.getByProject(projectId, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      console.log('✅ Tasks fetched:', results.length);
      res.json(results);
    });
  },

  getTaskById: (req, res) => {
    const { taskId } = req.params;
    console.log('🔍 GET task by ID:', taskId);

    Task.getById(taskId, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch task' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(results[0]);
    });
  },

  createTask: (req, res) => {
    const taskData = req.body;
    console.log('📝 CREATE task:', taskData);

    if (!taskData.project_id || !(taskData.name || taskData.title)) {
      return res.status(400).json({ 
        error: 'Missing required fields: project_id and name/title are mandatory' 
      });
    }

    Task.create(taskData, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to create task' });
      }
      console.log('✅ Task created successfully');
      res.json({ 
        success: true, 
        taskId: results.insertId,
        message: 'Task created successfully'
      });
    });
  },

  updateTaskStatus: (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    console.log('🔄 UPDATE task status:', taskId, status);

    Task.updateStatus(taskId, status, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to update task status' });
      }
      res.json({ success: true, message: 'Task status updated successfully' });
    });
  },

  updateTaskStatusAndNotes: (req, res) => {
    const { taskId } = req.params;
    const { status, client_notes } = req.body;
    console.log('📝 UPDATE task with notes:', taskId, status, client_notes);

    Task.updateStatusAndNotes(taskId, status, client_notes, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to update task' });
      }
      res.json({ success: true, message: 'Task updated successfully' });
    });
  },

  updateTask: (req, res) => {
    const { taskId } = req.params;
    const updates = req.body;
    console.log('✏️ UPDATE task details:', taskId, updates);

    Task.updateDetails(taskId, updates, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to update task' });
      }
      res.json({ success: true, message: 'Task updated successfully' });
    });
  },

  deleteTask: (req, res) => {
    const { taskId } = req.params;
    console.log('🗑️ DELETE task:', taskId);

    Task.delete(taskId, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to delete task' });
      }
      res.json({ success: true, message: 'Task deleted successfully' });
    });
  },

  getManagerTasks: (req, res) => {
    const { managerId } = req.params;
    console.log('👔 GET manager tasks:', managerId);

    Task.getTasksForManager(managerId, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch manager tasks' });
      }
      res.json(results);
    });
  },

  getOverdueTasks: (req, res) => {
    const { managerId } = req.params;
    console.log('⏰ GET overdue tasks for manager:', managerId);

    Task.getOverdueTasks(managerId, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch overdue tasks' });
      }
      res.json(results);
    });
  }
};

// ✅ DEBUG: Check controller methods
console.log('✅ taskController methods loaded:', Object.keys(taskController));

module.exports = taskController;