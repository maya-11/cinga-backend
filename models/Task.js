// models/Task.js - COMPLETE WITH ALL METHODS
const db = require('../config/db');

class Task {
  static getByProject(projectId, callback) {
    console.log('🔍 Task.getByProject called for project:', projectId);
    
    const query = `
      SELECT 
        t.*, 
        u.name as assigned_name,
        t.title as name  -- Map 'title' to 'name' for frontend
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = ?
      ORDER BY t.due_date ASC
    `;
    
    console.log('📊 Executing query for project:', projectId);
    
    db.query(query, [projectId], (err, results) => {
      if (err) {
        console.error('❌ Database query error:', err);
        return callback(err, null);
      }
      console.log('✅ Query successful, found:', results.length, 'tasks');
      callback(null, results);
    });
  }

  static getById(taskId, callback) {
    const query = `
      SELECT 
        t.*, 
        p.title as project_name,
        t.title as name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `;
    db.query(query, [taskId], callback);
  }

  static create(taskData, callback) {
    const query = `
      INSERT INTO tasks (project_id, title, description, status, due_date, assigned_to, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const assignedTo = taskData.assigned_to && taskData.assigned_to !== '' 
      ? taskData.assigned_to 
      : null;
    
    const values = [
      taskData.project_id,
      taskData.name || taskData.title,
      taskData.description,
      taskData.status || 'todo',
      taskData.due_date || null,
      assignedTo,
      taskData.priority || 'medium'
    ];
    
    console.log('📝 Creating task with values:', values);
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('❌ Create task error:', err);
        return callback(err, null);
      }
      console.log('✅ Task created successfully, ID:', results.insertId);
      callback(null, { insertId: results.insertId });
    });
  }

  static updateStatus(taskId, status, callback) {
    const query = 'UPDATE tasks SET status = ? WHERE id = ?';
    db.query(query, [status, taskId], callback);
  }

  static updateStatusAndNotes(taskId, status, client_notes, callback) {
    const query = 'UPDATE tasks SET status = ?, description = COALESCE(?, description) WHERE id = ?';
    db.query(query, [status, client_notes, taskId], callback);
  }

  static updateDetails(taskId, updates, callback) {
    const query = `
      UPDATE tasks 
      SET title = ?, description = ?, assigned_to = ?, priority = ?, due_date = ?, status = ?
      WHERE id = ?
    `;
    const values = [
      updates.name || updates.title,
      updates.description,
      updates.assigned_to,
      updates.priority,
      updates.due_date,
      updates.status,
      taskId
    ];
    db.query(query, values, callback);
  }

  static delete(taskId, callback) {
    const query = 'DELETE FROM tasks WHERE id = ?';
    db.query(query, [taskId], callback);
  }

  static getTasksForManager(managerId, callback) {
    const query = `
      SELECT 
        t.*, 
        p.title as project_name, 
        u.name as assigned_name,
        t.title as name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE p.manager_id = ?
      ORDER BY t.due_date ASC
    `;
    db.query(query, [managerId], callback);
  }

  static getOverdueTasks(managerId, callback) {
    const query = `
      SELECT 
        t.*, 
        p.title as project_name,
        t.title as name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.manager_id = ? 
        AND t.status != 'completed' 
        AND t.due_date < CURDATE()
    `;
    db.query(query, [managerId], callback);
  }
}

// ✅ DEBUG: Check model methods
console.log('✅ Task model methods loaded:', Object.keys(Task));

module.exports = Task;