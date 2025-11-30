const db = require('../config/db');

class Manager {
  static findByFirebaseUid(firebaseUid, callback) {
    const query = 'SELECT * FROM managers WHERE firebase_uid = ?';
    db.query(query, [firebaseUid], callback);
  }

  static findById(managerId, callback) {
    const query = 'SELECT * FROM managers WHERE id = ?';
    db.query(query, [managerId], callback);
  }

  static getManagerStats(managerId, callback) {
    const query = `
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects,
        SUM(budget) as total_budget,
        AVG(completion_percentage) as avg_completion
      FROM projects 
      WHERE manager_id = ?
    `;
    db.query(query, [managerId], callback);
  }

  static getManagerProjects(managerId, callback) {
    const query = 'SELECT * FROM manager_projects WHERE manager_id = ? ORDER BY created_at DESC';
    db.query(query, [managerId], callback);
  }

  static getOverdueTasks(managerId, callback) {
    const query = `
      SELECT COUNT(*) as overdue_tasks 
      FROM tasks t 
      JOIN projects p ON t.project_id = p.id 
      WHERE p.manager_id = ? 
      AND t.due_date < NOW() 
      AND t.status != 'completed'
    `;
    db.query(query, [managerId], callback);
  }
}

module.exports = Manager;