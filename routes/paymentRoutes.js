const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all payments for a project
router.get('/project/:projectId', authenticateToken, (req, res) => {
  const { projectId } = req.params;

  Payment.getByProject(projectId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }
    res.json(results);
  });
});

// Create new payment
router.post('/', authenticateToken, (req, res) => {
  const paymentData = req.body;

  Payment.create(paymentData, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create payment' });
    }
    res.json({ message: 'Payment created successfully', paymentId: paymentData.id });
  });
});

// Update payment status
router.patch('/:paymentId/status', authenticateToken, (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;

  Payment.updateStatus(paymentId, status, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update payment' });
    }
    res.json({ message: 'Payment status updated successfully' });
  });
});

// Get payment summary for project
router.get('/project/:projectId/summary', authenticateToken, (req, res) => {
  const { projectId } = req.params;

  Payment.getProjectTotal(projectId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch payment summary' });
    }
    res.json(results[0]);
  });
});

module.exports = router;