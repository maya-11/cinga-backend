const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = require('./config/db');

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cinga Backend is running',
    timestamp: new Date().toISOString()
  });
});

// NOTIFICATIONS ROUTES
app.get('/api/notifications/user/:userId', (req, res) => {
  const { userId } = req.params;
  const db = require('./config/db');
  
  const query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    res.json(results);
  });
});

// PROJECTS ROUTES
app.get('/api/projects/manager/:managerId', (req, res) => {
  const { managerId } = req.params;
  
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
  
  db.query(query, [managerId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    res.json(results);
  });
});

app.get('/api/projects/client/:clientId', (req, res) => {
  const { clientId } = req.params;
  
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
  
  db.query(query, [clientId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    res.json(results);
  });
});

app.get('/api/projects/:projectId', (req, res) => {
  const { projectId } = req.params;
  
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
  
  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(results[0]);
  });
});

// TASKS ROUTES
app.get('/api/tasks/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  
  const query = `
    SELECT t.*, u.name as assigned_name
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = ?
    ORDER BY 
      CASE t.priority 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      t.due_date ASC
  `;
  
  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(results);
  });
});

// PAYMENTS ROUTES
app.get('/api/payments/project/:projectId', (req, res) => {
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

// USERS ROUTES
app.get('/api/users/firebase/:firebaseUid', (req, res) => {
  const { firebaseUid } = req.params;
  
  const query = 'SELECT * FROM users WHERE firebase_uid = ?';
  
  db.query(query, [firebaseUid], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

app.post('/api/users/sync-firebase-user', (req, res) => {
  const { firebase_uid, email, name, role } = req.body;
  
  const query = `
    INSERT INTO users (firebase_uid, email, name, role) 
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    email = VALUES(email), 
    name = VALUES(name), 
    role = VALUES(role)
  `;
  
  db.query(query, [firebase_uid, email, name, role], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to sync user' });
    }
    
    // Get the user data
    db.query('SELECT * FROM users WHERE firebase_uid = ?', [firebase_uid], (err, userResults) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      res.json(userResults[0]);
    });
  });
});

// TEST ROUTES
app.get('/api/test/database', (req, res) => {
  const tables = ['users', 'projects', 'tasks', 'payments', 'notifications'];
  const results = {};
  let completed = 0;

  tables.forEach(table => {
    db.query(`SELECT COUNT(*) as count FROM ${table}`, (err, result) => {
      if (err) {
        results[table] = { error: err.message };
      } else {
        results[table] = { count: result[0].count };
      }
      
      completed++;
      if (completed === tables.length) {
        res.json({
          message: 'Database connection test',
          database: process.env.DB_NAME,
          tables: results
        });
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Cinga Backend Server running on port ${PORT}`);
  console.log(`✅ Test these endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Manager Projects: http://localhost:${PORT}/api/projects/manager/1`);
  console.log(`   Client Projects: http://localhost:${PORT}/api/projects/client/2`);
  console.log(`   Project Tasks: http://localhost:${PORT}/api/tasks/project/1`);
  console.log(`   Project Payments: http://localhost:${PORT}/api/payments/project/1`);
  console.log(`   Notifications: http://localhost:${PORT}/api/notifications/user/1`);
  console.log(`   Database Test: http://localhost:${PORT}/api/test/database`);
});