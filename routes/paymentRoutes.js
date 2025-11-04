const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get payments for a project
router.get('/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  
  const query = `
    SELECT * FROM payments 
    WHERE project_id = ? 
    ORDER BY created_at DESC
  `;
  
  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }
    
    // Calculate totals
    const totalPaid = results
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    const pendingAmount = results
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    res.json({
      payments: results,
      summary: {
        totalPaid,
        pendingAmount,
        totalPayments: results.length
      }
    });
  });
});

// Create new payment
router.post('/', (req, res) => {
  const { project_id, amount, description, status = 'pending' } = req.body;
  
  const payment_date = status === 'completed' ? new Date() : null;
  
  const query = `
    INSERT INTO payments (project_id, amount, payment_date, status, description) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(query, [project_id, amount, payment_date, status, description], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create payment' });
    }
    res.json({ message: 'Payment created successfully', paymentId: results.insertId });
  });
});

module.exports = router;