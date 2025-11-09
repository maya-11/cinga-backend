const Payment = require('../models/Payment');
const notificationService = require('../services/notificationService');

const paymentController = {
  // Get all payments for a project
  getProjectPayments: (req, res) => {
    const { projectId } = req.params;

    Payment.getByProject(projectId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch payments' });
      }
      res.json(results);
    });
  },

  // Create new payment
  createPayment: (req, res) => {
    const paymentData = req.body;

    Payment.create(paymentData, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create payment' });
      }
      res.json({ message: 'Payment created successfully', paymentId: paymentData.id });
    });
  },

  // Update payment status
  updatePaymentStatus: async (req, res) => {
    const { paymentId } = req.params;
    const { status } = req.body;

    Payment.updateStatus(paymentId, status, async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update payment' });
      }

      // Send notification if payment is completed
      if (status === 'completed') {
        try {
          // In real app, you'd fetch client and project details
          await notificationService.notifyPaymentDue(
            'client_id', // Would come from payment data
            'client@example.com',
            'Client Name',
            'Project Name',
            1000, // Amount
            new Date() // Due date
          );
        } catch (notificationError) {
          console.error('Payment notification failed:', notificationError);
        }
      }

      res.json({ message: 'Payment status updated successfully' });
    });
  },

  // Get payment summary for project
  getPaymentSummary: (req, res) => {
    const { projectId } = req.params;

    Payment.getProjectTotal(projectId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch payment summary' });
      }
      res.json(results[0]);
    });
  }
};

module.exports = paymentController;