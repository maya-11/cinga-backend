const db = require('../config/db');

class Project {
  static getManagerProjects(managerId, callback) {
    const query = `
      SELECT p.*,
             u.name as client_name,
             u.email as client_email,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE p.manager_id = ? AND (p.is_archived = FALSE OR p.is_archived IS NULL)
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
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks
      FROM projects p
      JOIN users u ON p.manager_id = u.id
      WHERE p.client_id = ? AND (p.is_archived = FALSE OR p.is_archived IS NULL)
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
    const query = 'UPDATE projects SET completion_percentage = ?, updated_at = NOW() WHERE id = ?';
    db.query(query, [completionPercentage, projectId], callback);
  }

  static updateDetails(projectId, updates, callback) {
    const query = `
      UPDATE projects 
      SET title = ?, description = ?, budget = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const values = [
      updates.title || updates.name,
      updates.description,
      updates.budget,
      updates.status,
      projectId
    ];
    db.query(query, values, callback);
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
      WHERE manager_id = ? AND (is_archived = FALSE OR is_archived IS NULL)
    `;
    db.query(query, [managerId], callback);
  }

  static create(projectData, callback) {
    const query = `
      INSERT INTO projects (id, title, description, manager_id, client_id, budget, status, start_date, deadline, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const values = [
      projectData.id,
      projectData.title, // Changed from name to title for consistency
      projectData.description,
      projectData.manager_id,
      projectData.client_id,
      projectData.budget,
      projectData.status || 'active',
      projectData.start_date || projectData.startDate,
      projectData.deadline || projectData.end_date
    ];
    db.query(query, values, callback);
  }

  // Delete project
  static delete(projectId, callback) {
    const query = 'DELETE FROM projects WHERE id = ?';
    db.query(query, [projectId], callback);
  }

  // Get all projects (for admin)
  static getAll(callback) {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';
    db.query(query, callback);
  }

  // Archive project
  static archive(projectId, callback) {
    const query = 'UPDATE projects SET is_archived = TRUE, updated_at = NOW() WHERE id = ?';
    db.query(query, [projectId], callback);
  }

  // Unarchive project  
  static unarchive(projectId, callback) {
    const query = 'UPDATE projects SET is_archived = FALSE, updated_at = NOW() WHERE id = ?';
    db.query(query, [projectId], callback);
  }

  // ✅ ADDED: Check if project exists and belongs to manager
  static verifyManagerOwnership(projectId, managerId, callback) {
    const query = 'SELECT id FROM projects WHERE id = ? AND manager_id = ?';
    db.query(query, [projectId, managerId], callback);
  }

  // ✅ ADDED: Get client dashboard stats
  static getClientDashboardStats(userId, callback) {
    const query = `
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        COALESCE(SUM(budget), 0) as total_investment
      FROM projects 
      WHERE client_id = ? AND (is_archived = FALSE OR is_archived IS NULL)
    `;
    db.query(query, [userId], callback);
  }

  // ✅ ADDED: Get client upcoming deadlines
  static getClientUpcomingDeadlines(userId, callback) {
    const query = `
      SELECT * FROM projects 
      WHERE client_id = ? 
      AND deadline IS NOT NULL 
      AND deadline > NOW()
      AND status = 'active'
      AND (is_archived = FALSE OR is_archived IS NULL)
      ORDER BY deadline ASC 
      LIMIT 5
    `;
    db.query(query, [userId], callback);
  }

  // ✅ ADDED: Simple get client projects (for debug routes)
  static getClientProjectsSimple(userId, callback) {
    const query = `
      SELECT * FROM projects 
      WHERE client_id = ? 
      AND (is_archived = FALSE OR is_archived IS NULL)
      ORDER BY created_at DESC
    `;
    db.query(query, [userId], callback);
  }

  // ✅ ADDED: Update project progress
  static updateProgress(projectId, completion_percentage, callback) {
    const query = 'UPDATE projects SET completion_percentage = ?, updated_at = NOW() WHERE id = ?';
    db.query(query, [completion_percentage, projectId], callback);
  }

  // ✅ ADDED: Get archived manager projects
  static getArchivedManagerProjects(managerId, callback) {
    const query = `
      SELECT p.*,
             u.name as client_name,
             u.email as client_email
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE p.manager_id = ? AND p.is_archived = TRUE
      ORDER BY p.updated_at DESC
    `;
    db.query(query, [managerId], callback);
  }
}

module.exports = Project;