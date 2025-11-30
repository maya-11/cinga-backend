const Project = require('../models/Project');
const db = require('../config/db');

const projectController = {
  // Get all projects for manager
  getManagerProjects: (req, res) => {
    const { managerId } = req.params;

    Project.getManagerProjects(managerId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }
      res.json(results);
    });
  },

  // Get projects for client
  getClientProjects: (req, res) => {
    const { clientId } = req.params;

    Project.getClientProjects(clientId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }
      res.json(results);
    });
  },

  // Get single project details
  getProjectById: (req, res) => {
    const { projectId } = req.params;

    Project.getById(projectId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch project' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(results[0]);
    });
  },

  // Create new project WITHOUT Trello
  createProject: (req, res) => {
    const projectData = req.body;

    console.log('🚀 Creating project...');
    console.log('Project data:', projectData);
    console.log('User making request:', req.user);

    // First, get the user's database ID from Firebase UID
    const getUserQuery = 'SELECT id FROM users WHERE firebase_uid = ?';
    
    db.query(getUserQuery, [req.user.firebase_uid], (err, userResults) => {
      if (err) {
        console.error('Database error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ error: 'User not found in database' });
      }

      const userDbId = userResults[0].id;
      console.log('✅ User database ID:', userDbId);

      // Create project with database ID, not Firebase UID
      const createQuery = `
        INSERT INTO projects (title, description, manager_id, client_id, budget, status, start_date, deadline, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        projectData.title,
        projectData.description,
        userDbId, // Use database ID here
        projectData.client_id,
        projectData.budget,
        projectData.status || 'active',
        projectData.start_date,
        projectData.deadline
      ];

      db.query(createQuery, values, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create project' });
        }

        res.json({ 
          message: 'Project created successfully', 
          projectId: results.insertId
        });
      });
    });
  },

  // 🆕 ADD: Update Project Details (Basic Update)
  updateProject: (req, res) => {
    const { projectId } = req.params;
    const { title, description, budget, status, deadline } = req.body;

    console.log('🔄 Updating project:', projectId);
    console.log('Update data:', { title, description, budget, status, deadline });

    // First verify user owns this project using Firebase UID
    const verifyQuery = `
      SELECT p.*, 
             manager.firebase_uid as manager_firebase_uid,
             client.firebase_uid as client_firebase_uid
      FROM projects p
      JOIN users manager ON p.manager_id = manager.id
      JOIN users client ON p.client_id = client.id
      WHERE p.id = ?
    `;
    
    db.query(verifyQuery, [projectId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch project' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = results[0];
      const userFirebaseUid = req.user.firebase_uid;
      
      // Verify the current user is either the manager OR client of this project
      if (project.manager_firebase_uid !== userFirebaseUid && project.client_firebase_uid !== userFirebaseUid) {
        return res.status(403).json({ error: 'Access denied. Not your project.' });
      }

      // Build update query dynamically based on provided fields
      const updates = [];
      const values = [];
      
      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      if (budget !== undefined) {
        updates.push('budget = ?');
        values.push(budget);
      }
      if (status !== undefined) {
        updates.push('status = ?');
        values.push(status);
      }
      if (deadline !== undefined) {
        updates.push('deadline = ?');
        values.push(deadline);
      }
      
      // Always update the updated_at timestamp
      updates.push('updated_at = NOW()');
      
      if (updates.length === 1) { // Only updated_at was added
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      
      values.push(projectId);
      
      const updateQuery = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
      
      db.query(updateQuery, values, (err, updateResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update project' });
        }

        console.log(`✅ Project ${projectId} updated successfully by user ${userFirebaseUid}`);

        res.json({ 
          success: true,
          message: 'Project updated successfully',
          updatedFields: { title, description, budget, status, deadline }
        });
      });
    });
  },

  // 🆕 ADD: Delete Project (Hard Delete)
  deleteProject: (req, res) => {
    const { projectId } = req.params;

    console.log('🗑️ Deleting project:', projectId);
    console.log('User Firebase UID:', req.user.firebase_uid);

    // STEP 1: Get user's database ID from Firebase UID
    const getUserQuery = 'SELECT id FROM users WHERE firebase_uid = ?';
    
    db.query(getUserQuery, [req.user.firebase_uid], (err, userResults) => {
      if (err) {
        console.error('❌ Database error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ error: 'User not found in database' });
      }

      const userDbId = userResults[0].id;

      // STEP 2: Verify manager owns this project
      const projectQuery = 'SELECT * FROM projects WHERE id = ? AND manager_id = ?';
      
      db.query(projectQuery, [projectId, userDbId], (err, projectResults) => {
        if (err) {
          console.error('❌ Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch project' });
        }

        if (projectResults.length === 0) {
          return res.status(403).json({ 
            error: 'Access denied. Project not found or not owned by you.'
          });
        }

        // STEP 3: Delete the project (HARD DELETE)
        Project.delete(projectId, (err, deleteResults) => {
          if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Failed to delete project' });
          }

          console.log(`✅ Manager ${userDbId} deleted project ${projectId}`);

          res.json({ 
            success: true,
            message: 'Project deleted permanently',
            projectId: projectId
          });
        });
      });
    });
  },

  // Update project completion percentage
  updateProjectCompletion: (req, res) => {
    const { projectId } = req.params;
    const { completion_percentage } = req.body;

    Project.updateCompletion(projectId, completion_percentage, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update project' });
      }
      res.json({ message: 'Project updated successfully' });
    });
  },

  // CLIENT: Update project progress (only completion percentage)
  updateProjectProgress: (req, res) => {
    const { projectId } = req.params;
    const { completion_percentage, client_notes } = req.body;

    // First verify client has access to this project using Firebase UID
    const clientProjectQuery = `
      SELECT p.*, c.firebase_uid as client_firebase_uid
      FROM projects p
      JOIN users c ON p.client_id = c.id
      WHERE p.id = ?
    `;
    
    db.query(clientProjectQuery, [projectId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch project' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = results[0];
      
      // Verify the current user is the client assigned to this project using Firebase UID
      if (project.client_firebase_uid !== req.user.firebase_uid) {
        return res.status(403).json({ error: 'Access denied. Not your project.' });
      }

      // Client can only update completion percentage and notes
      Project.updateCompletion(projectId, completion_percentage, (err, updateResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update project' });
        }

        // Create activity log for this update
        console.log(`Client ${req.user.firebase_uid} updated project ${projectId} progress to ${completion_percentage}%`);

        res.json({ 
          message: 'Project progress updated successfully',
          completion_percentage,
          client_notes 
        });
      });
    });
  },

  // MANAGER: Update project details (FIXED - uses Firebase UID)
  managerUpdateProject: (req, res) => {
    const { projectId } = req.params;
    const { title, description, budget, status } = req.body;

    // First verify manager owns this project using Firebase UID
    const managerProjectQuery = `
      SELECT p.*, m.firebase_uid as manager_firebase_uid
      FROM projects p
      JOIN users m ON p.manager_id = m.id
      WHERE p.id = ?
    `;
    
    db.query(managerProjectQuery, [projectId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch project' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = results[0];
      
      // Verify the current user is the manager of this project using Firebase UID
      if (project.manager_firebase_uid !== req.user.firebase_uid) {
        return res.status(403).json({ error: 'Access denied. Not your project.' });
      }

      // Manager can update project details
      Project.updateDetails(projectId, { title, description, budget, status }, (err, updateResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update project' });
        }

        console.log(`Manager ${req.user.firebase_uid} updated project ${projectId} details`);

        res.json({ 
          message: 'Project updated successfully',
          updates: { title, description, budget, status }
        });
      });
    });
  },

  // Get project statistics for manager dashboard
  getManagerStats: (req, res) => {
    const { managerId } = req.params;

    Project.getManagerStats(managerId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
      res.json(results[0]);
    });
  },

  // ARCHIVE PROJECT - DEBUG VERSION
  archiveProject: (req, res) => {
    const { projectId } = req.params;

    console.log('🔍 DEBUG Archive Request:');
    console.log('Project ID:', projectId);
    console.log('User Firebase UID:', req.user.firebase_uid);

    // STEP 1: Get user's database ID from Firebase UID
    const getUserQuery = 'SELECT id, firebase_uid, name, email FROM users WHERE firebase_uid = ?';
    
    db.query(getUserQuery, [req.user.firebase_uid], (err, userResults) => {
      if (err) {
        console.error('❌ Database error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      console.log('🔍 DEBUG User query results:', userResults);

      if (userResults.length === 0) {
        console.log('❌ No user found with Firebase UID:', req.user.firebase_uid);
        
        // Let's see what users exist
        const allUsersQuery = 'SELECT id, firebase_uid, name FROM users WHERE role = "manager" LIMIT 5';
        db.query(allUsersQuery, (err, allManagers) => {
          console.log('🔍 Available managers:', allManagers);
          return res.status(404).json({ 
            error: 'User not found in database',
            your_uid: req.user.firebase_uid,
            available_managers: allManagers
          });
        });
        return;
      }

      const userDbId = userResults[0].id;
      console.log('✅ User found - Database ID:', userDbId);

      // STEP 2: Verify manager owns this project using database ID
      const projectQuery = 'SELECT * FROM projects WHERE id = ? AND manager_id = ?';
      
      db.query(projectQuery, [projectId, userDbId], (err, projectResults) => {
        if (err) {
          console.error('❌ Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch project' });
        }

        console.log('🔍 DEBUG Project verification results:', projectResults);

        if (projectResults.length === 0) {
          // Let's check if the project exists at all
          const checkProjectQuery = 'SELECT * FROM projects WHERE id = ?';
          db.query(checkProjectQuery, [projectId], (err, projectExists) => {
            console.log('🔍 Project existence check:', projectExists);
            
            return res.status(403).json({ 
              error: 'Access denied. Project not found or not owned by you.',
              details: {
                projectId: projectId,
                yourManagerId: userDbId,
                projectExists: projectExists.length > 0,
                projectManagerId: projectExists.length > 0 ? projectExists[0].manager_id : 'unknown'
              }
            });
          });
          return;
        }

        // STEP 3: Archive the project
        Project.archive(projectId, (err, archiveResults) => {
          if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Failed to archive project' });
          }

          console.log(`✅ Manager ${userDbId} archived project ${projectId}`);

          res.json({ 
            success: true,
            message: 'Project archived successfully',
            projectId: projectId
          });
        });
      });
    });
  },

  // UNARCHIVE PROJECT - DEBUG VERSION
  unarchiveProject: (req, res) => {
    const { projectId } = req.params;

    console.log('🔍 DEBUG Unarchive Request:');
    console.log('Project ID:', projectId);
    console.log('User Firebase UID:', req.user.firebase_uid);

    // STEP 1: Get user's database ID from Firebase UID
    const getUserQuery = 'SELECT id, firebase_uid, name, email FROM users WHERE firebase_uid = ?';
    
    db.query(getUserQuery, [req.user.firebase_uid], (err, userResults) => {
      if (err) {
        console.error('❌ Database error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      console.log('🔍 DEBUG User query results:', userResults);

      if (userResults.length === 0) {
        console.log('❌ No user found with Firebase UID:', req.user.firebase_uid);
        return res.status(404).json({ 
          error: 'User not found in database',
          your_uid: req.user.firebase_uid
        });
      }

      const userDbId = userResults[0].id;
      console.log('✅ User found - Database ID:', userDbId);

      // STEP 2: Verify manager owns this project using database ID
      const projectQuery = 'SELECT * FROM projects WHERE id = ? AND manager_id = ?';
      
      db.query(projectQuery, [projectId, userDbId], (err, projectResults) => {
        if (err) {
          console.error('❌ Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch project' });
        }

        console.log('🔍 DEBUG Project verification results:', projectResults);

        if (projectResults.length === 0) {
          return res.status(403).json({ 
            error: 'Access denied. Project not found or not owned by you.',
            details: {
              projectId: projectId,
              yourManagerId: userDbId
            }
          });
        }

        // STEP 3: Unarchive the project
        Project.unarchive(projectId, (err, unarchiveResults) => {
          if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Failed to unarchive project' });
          }

          console.log(`✅ Manager ${userDbId} unarchived project ${projectId}`);

          res.json({ 
            success: true,
            message: 'Project unarchived successfully',
            projectId: projectId
          });
        });
      });
    });
  },

  // GET ARCHIVED PROJECTS
  getArchivedManagerProjects: (req, res) => {
    const { managerId } = req.params;

    Project.getArchivedManagerProjects(managerId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch archived projects' });
      }
      res.json(results);
    });
  }
};

module.exports = projectController;