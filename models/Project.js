const db = require('../config/db');

class Project {
  static getManagerProjects(managerId, callback) {
    const query = `
      SELECT p.*,
             u.name as client_name,
             u.email as client_email,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks,
             (SELECT SUM(amount) FROM payments pay WHERE pay.project_id = p.id AND pay.status = 'completed') as total_paid
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE p.manager_id = ?
      ORDER BY p.created_at DESC
    `;
    db.query(query, [managerId], callback);
  }

  static getClientProjects(clientId, callback) {
    const query = `
      SELECT p.*,
             u.name as manager_name,
             u.email as manager_email,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks,
             (SELECT SUM(amount) FROM payments pay WHERE pay.project_id = p.id AND pay.status = 'completed') as total_paid
      FROM projects p
      JOIN users u ON p.manager_id = u.id
      WHERE p.client_id = ?
      ORDER BY p.created_at DESC
    `;
    db.query(query, [clientId], callback);
  }

  static getById(projectId, callback) {
    const query = `
      SELECT p.*,
             manager.name as manager_name,
             manager.email as manager_email,
             client.name as client_name,
             client.email as client_email
      FROM projects p
      JOIN users manager ON p.manager_id = manager.id
      JOIN users client ON p.client_id = client.id
      WHERE p.id = ?
    `;
    db.query(query, [projectId], callback);
  }

  static updateCompletion(projectId, completionPercentage, callback) {
    const query = 'UPDATE projects SET completion_percentage = ? WHERE id = ?';
    db.query(query, [completionPercentage, projectId], callback);
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

  static create(projectData, callback) {
    const query = `
      INSERT INTO projects (id, name, description, manager_id, client_id, budget, status, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      projectData.id,
      projectData.name,
      projectData.description,
      projectData.manager_id,
      projectData.client_id,
      projectData.budget,
      projectData.status || 'active',
      projectData.start_date,
      projectData.end_date
    ];
    db.query(query, values, callback);
  }
}

module.exports = Project;