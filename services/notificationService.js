const db = require('../config/db');
const mockEmailService = require('./mockEmailService'); // Use mock instead of real

class NotificationService {
  // Create in-app notification
  createNotification(userId, title, message, type = 'info') {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notifications (id, user_id, title, message, type, is_read)
        VALUES (UUID(), ?, ?, ?, ?, false)
      `;

      db.query(query, [userId, title, message, type], (err, results) => {
        if (err) {
          console.error('Failed to create notification:', err);
          reject(err);
        } else {
          console.log(`📢 Notification created for user ${userId}: ${title}`);
          resolve(results);
        }
      });
    });
  }

  // Notify task assignment
  async notifyTaskAssignment(userId, userEmail, userName, taskName, projectName, dueDate) {
    try {
      // Create in-app notification
      await this.createNotification(
        userId,
        'New Task Assigned',
        `You have been assigned to "${taskName}" in project "${projectName}"`,
        'assignment'
      );

      // Send mock email notification
      if (userEmail) {
        await mockEmailService.sendTaskAssignment(userEmail, userName, taskName, projectName, dueDate);
      }

      return { success: true, mock: true };
    } catch (error) {
      console.error('Task assignment notification failed:', error);
      return { success: false, error: error.message, mock: true };
    }
  }

  // Notify project completion
  async notifyProjectCompletion(clientId, clientEmail, clientName, projectName, managerName) {
    try {
      await this.createNotification(
        clientId,
        'Project Completed',
        `Your project "${projectName}" has been completed by ${managerName}`,
        'success'
      );

      if (clientEmail) {
        await mockEmailService.sendProjectCompletion(clientEmail, clientName, projectName, managerName);
      }

      return { success: true, mock: true };
    } catch (error) {
      console.error('Project completion notification failed:', error);
      return { success: false, error: error.message, mock: true };
    }
  }

  // Notify overdue task
  async notifyOverdueTask(userId, userEmail, userName, taskName, projectName, overdueDays) {
    try {
      await this.createNotification(
        userId,
        'Task Overdue',
        `Task "${taskName}" in project "${projectName}" is ${overdueDays} day(s) overdue`,
        'warning'
      );

      if (userEmail) {
        await mockEmailService.sendOverdueTaskNotification(userEmail, userName, taskName, projectName, overdueDays);
      }

      return { success: true, mock: true };
    } catch (error) {
      console.error('Overdue task notification failed:', error);
      return { success: false, error: error.message, mock: true };
    }
  }

  // Notify payment due
  async notifyPaymentDue(clientId, clientEmail, clientName, projectName, amount, dueDate) {
    try {
      await this.createNotification(
        clientId,
        'Payment Due Soon',
        `Payment of $${amount} for project "${projectName}" is due on ${new Date(dueDate).toLocaleDateString()}`,
        'payment'
      );

      if (clientEmail) {
        await mockEmailService.sendPaymentReminder(clientEmail, clientName, projectName, amount, dueDate);
      }

      return { success: true, mock: true };
    } catch (error) {
      console.error('Payment due notification failed:', error);
      return { success: false, error: error.message, mock: true };
    }
  }

  // Get unread notifications count
  getUnreadCount(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false';
      
      db.query(query, [userId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      });
    });
  }
}

module.exports = new NotificationService();