const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');

// ✅ ADD DEBUG ROUTE FIRST (for testing)
router.get('/debug/user/:firebaseUid', (req, res) => {
  const { firebaseUid } = req.params;
  console.log('🔍 Debug: Checking user with firebase_uid:', firebaseUid);
  
  User.findByFirebaseUid(firebaseUid, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log('📊 Debug results:', {
      found: results.length > 0,
      user: results[0] || 'NOT FOUND',
      totalUsers: results.length
    });
    
    res.json({
      exists: results.length > 0,
      user: results[0] || null,
      totalUsers: results.length
    });
  });
});

// ✅ SYNC FIREBASE USER TO DATABASE
router.post('/sync-firebase-user', async (req, res) => {
  try {
    const { firebase_uid, email, name, role = 'client' } = req.body;
    
    console.log('🔄 Syncing Firebase user to database:', { firebase_uid, email, name });
    
    // Check if user already exists
    User.findByFirebaseUid(firebase_uid, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length > 0) {
        console.log('✅ User already exists in database');
        return res.json({ 
          message: 'User already exists',
          user: results[0]
        });
      }
      
      // Create new user in database
      User.create({
        firebase_uid,
        email,
        name: name || email.split('@')[0], // Use email prefix if no name
        role
      }, (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Failed to create user' });
        }
        
        console.log('✅ New user created in database with ID:', result.insertId);
        res.json({ 
          message: 'User created successfully',
          userId: result.insertId
        });
      });
    });
    
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// ✅ TEMPORARY: CREATE TEST USER (for quick testing)
router.post('/create-test-user', (req, res) => {
  const testUser = {
    firebase_uid: '5nC1uYRiPmOu5Jp9xZLhOiwrg4J3',
    email: 'test@cinga.com',
    name: 'Test User',
    role: 'client'
  };
  
  User.create(testUser, (err, result) => {
    if (err) {
      console.error('Error creating test user:', err);
      return res.status(500).json({ error: 'Failed to create test user' });
    }
    
    console.log('✅ Test user created with ID:', result.insertId);
    res.json({ message: 'Test user created successfully', userId: result.insertId });
  });
});

// ✅ DEBUG: GET ALL USERS
router.get('/debug/all-users', (req, res) => {
  const query = 'SELECT id, name, email, firebase_uid, role, created_at FROM users';
  
  const db = require('../config/db');
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log('📋 All users in database:', results);
    res.json({
      totalUsers: results.length,
      users: results
    });
  });
});

// Your existing routes...
router.get('/clients', (req, res) => {
  User.getClients((err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch clients' });
    }
    res.json(results);
  });
});

router.get('/managers', (req, res) => {
  User.getManagers((err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch managers' });
    }
    res.json(results);
  });
});

module.exports = router;