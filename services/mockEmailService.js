class MockEmailService {
  constructor() {
    this.sentEmails = [];
    console.log('🔧 Mock Email Service initialized - No email credentials needed');
  }

  // Mock email sender - logs instead of actually sending
  async sendEmail(to, subject, html) {
    try {
      console.log('📧 MOCK EMAIL SENT:');
      console.log('   To:', to);
      console.log('   Subject:', subject);
      console.log('   HTML Length:', html.length, 'characters');
      
      // Store for debugging
      this.sentEmails.push({
        to,
        subject,
        timestamp: new Date().toISOString(),
        htmlPreview: html.substring(0, 100) + '...'
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('✅ Mock email sent successfully (logged to console)');
      return { 
        success: true, 
        mock: true,
        message: 'Email logged to console (mock service)'
      };
      
    } catch (error) {
      console.error('❌ Mock email sending failed:', error);
      return { 
        success: false, 
        error: 'Mock email failed',
        mock: true 
      };
    }
  }

  // Mock task assignment email
  async sendTaskAssignment(userEmail, userName, taskName, projectName, dueDate) {
    const subject = `[MOCK] New Task Assigned: ${taskName}`;
    const html = this.generateTaskAssignmentEmail(userName, taskName, projectName, dueDate);
    return await this.sendEmail(userEmail, subject, html);
  }

  // Mock project completion email
  async sendProjectCompletion(clientEmail, clientName, projectName, managerName) {
    const subject = `[MOCK] Project Completed: ${projectName}`;
    const html = this.generateProjectCompletionEmail(clientName, projectName, managerName);
    return await this.sendEmail(clientEmail, subject, html);
  }

  // Mock payment reminder email
  async sendPaymentReminder(clientEmail, clientName, projectName, amount, dueDate) {
    const subject = `[MOCK] Payment Reminder: ${projectName}`;
    const html = this.generatePaymentReminderEmail(clientName, projectName, amount, dueDate);
    return await this.sendEmail(clientEmail, subject, html);
  }

  // Mock overdue task email
  async sendOverdueTaskNotification(userEmail, userName, taskName, projectName, overdueDays) {
    const subject = `[MOCK] Overdue Task: ${taskName}`;
    const html = this.generateOverdueTaskEmail(userName, taskName, projectName, overdueDays);
    return await this.sendEmail(userEmail, subject, html);
  }

  // Email template generators
  generateTaskAssignmentEmail(userName, taskName, projectName, dueDate) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">📋 New Task Assigned (Mock Email)</h2>
        <p>Hello ${userName},</p>
        <p>You have been assigned a new task in project <strong>${projectName}</strong>:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin: 0; color: #555;">${taskName}</h3>
          <p style="margin: 10px 0 0 0; color: #777;">Due Date: ${new Date(dueDate).toLocaleDateString()}</p>
        </div>
        <p><em>This is a mock email. In production, this would be sent to your actual inbox.</em></p>
        <hr>
        <p style="color: #999; font-size: 12px;">Mock Email Service - Cinga App</p>
      </div>
    `;
  }

  generateProjectCompletionEmail(clientName, projectName, managerName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">🎉 Project Completed! (Mock Email)</h2>
        <p>Hello ${clientName},</p>
        <p>Your project <strong>${projectName}</strong> has been completed by ${managerName}.</p>
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 0; color: #27ae60;">All tasks completed and ready for review!</p>
        </div>
        <p><em>This is a mock email. In production, this would be sent to your actual inbox.</em></p>
        <hr>
        <p style="color: #999; font-size: 12px;">Mock Email Service - Cinga App</p>
      </div>
    `;
  }

  generatePaymentReminderEmail(clientName, projectName, amount, dueDate) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">💰 Payment Reminder (Mock Email)</h2>
        <p>Hello ${clientName},</p>
        <p>Payment reminder for project <strong>${projectName}</strong>:</p>
        <div style="background: #fde8e6; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 0; color: #e74c3c;">
            <strong>Amount:</strong> $${amount}<br>
            <strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}
          </p>
        </div>
        <p><em>This is a mock email. In production, this would be sent to your actual inbox.</em></p>
        <hr>
        <p style="color: #999; font-size: 12px;">Mock Email Service - Cinga App</p>
      </div>
    `;
  }

  generateOverdueTaskEmail(userName, taskName, projectName, overdueDays) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e67e22;">⚠️ Task Overdue (Mock Email)</h2>
        <p>Hello ${userName},</p>
        <p>Overdue task in project <strong>${projectName}</strong>:</p>
        <div style="background: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin: 0; color: #e67e22;">${taskName}</h3>
          <p style="margin: 10px 0 0 0; color: #777;">Overdue by: ${overdueDays} day(s)</p>
        </div>
        <p><em>This is a mock email. In production, this would be sent to your actual inbox.</em></p>
        <hr>
        <p style="color: #999; font-size: 12px;">Mock Email Service - Cinga App</p>
      </div>
    `;
  }

  // Get sent emails for debugging
  getSentEmails() {
    return this.sentEmails;
  }

  // Clear sent emails (for testing)
  clearSentEmails() {
    this.sentEmails = [];
  }
}

module.exports = new MockEmailService();