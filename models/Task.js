const db = require('../config/db');

class Task {
  static getByProject(projectId, callback) {
    const query = `
      SELECT t.*, u.name as assigned_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = ?
      ORDER BY t.due_date ASC
    `;
    db.query(query, [projectId], callback);
  }

  static create(taskData, callback) {
    const query = `
      INSERT INTO tasks (id, project_id, name, description, status, due_date, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      taskData.id,
      taskData.project_id,
      taskData.name,
      taskData.description,
      taskData.status || 'todo',
      taskData.due_date,
      taskData.assigned_to
    ];
    db.query(query, values, callback);
  }

  static updateStatus(taskId, status, callback) {
    const query = 'UPDATE tasks SET status = ? WHERE id = ?';
    db.query(query, [status, taskId], callback);
  }

  static getOverdueTasks(managerId, callback) {
    const query = `
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.manager_id = ? 
        AND t.status != 'completed' 
        AND t.due_date < CURDATE()
    `;
    db.query(query, [managerId], callback);
  }
}

module.exports = Task;