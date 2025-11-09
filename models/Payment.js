const db = require('../config/db');

class Payment {
  static getByProject(projectId, callback) {
    const query = 'SELECT * FROM payments WHERE project_id = ? ORDER BY due_date ASC';
    db.query(query, [projectId], callback);
  }

  static create(paymentData, callback) {
    const query = `
      INSERT INTO payments (id, project_id, amount, status, due_date)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      paymentData.id,
      paymentData.project_id,
      paymentData.amount,
      paymentData.status || 'pending',
      paymentData.due_date
    ];
    db.query(query, values, callback);
  }

  static updateStatus(paymentId, status, callback) {
    const query = 'UPDATE payments SET status = ?, paid_at = ? WHERE id = ?';
    const paidAt = status === 'completed' ? new Date() : null;
    db.query(query, [status, paidAt, paymentId], callback);
  }

  static getProjectTotal(projectId, callback) {
    const query = `
      SELECT 
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as paid_amount
      FROM payments 
      WHERE project_id = ?
    `;
    db.query(query, [projectId], callback);
  }
}

module.exports = Payment;