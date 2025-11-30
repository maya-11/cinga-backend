const db = require('./config/db');

const seedRealData = () => {
  console.log('🌱 Seeding real sample data...');

  // 1. Create Real Users
  const users = [
    // Managers
    { firebase_uid: 'manager_john_123', name: 'John Manager', email: 'john@cinga.com', role: 'manager' },
    { firebase_uid: 'manager_sarah_456', name: 'Sarah Wilson', email: 'sarah@cinga.com', role: 'manager' },
    
    // Clients  
    { firebase_uid: 'client_abc_789', name: 'ABC Corporation', email: 'contact@abccorp.com', role: 'client' },
    { firebase_uid: 'client_xyz_101', name: 'XYZ Enterprises', email: 'info@xyz.com', role: 'client' },
    { firebase_uid: 'client_tech_202', name: 'Tech Solutions Ltd', email: 'hello@techsolutions.com', role: 'client' }
  ];

  let usersCreated = 0;
  let projectsCreated = 0;
  let tasksCreated = 0;

  // Insert users
  users.forEach(user => {
    const query = 'INSERT IGNORE INTO users (firebase_uid, name, email, role) VALUES (?, ?, ?, ?)';    
    db.query(query, [user.firebase_uid, user.name, user.email, user.role], (err, result) => {
      if (err) {
        console.log('❌ User error:', err.message);
      } else {
        usersCreated++;
        console.log('✅ User:', user.name);
        
        // When all users are created, create projects
        if (usersCreated === users.length) {
          createProjects();
        }
      }
    });
  });

  function createProjects() {
    console.log('🏗️ Creating real projects...');
    
    const projects = [
      {
        title: 'Website Redesign',
        description: 'Complete website overhaul with modern design and responsive layout',
        manager_id: 1, // John Manager
        client_id: 3,  // ABC Corporation
        total_budget: 50000,
        current_spent: 32500,
        completion_percentage: 65,
        status: 'active',
        start_date: '2024-01-15',
        deadline: '2024-03-31',
        overdue_tasks: 2
      },
      {
        title: 'Mobile App Development',
        description: 'iOS and Android mobile application for customer engagement',
        manager_id: 2, // Sarah Wilson  
        client_id: 4,  // XYZ Enterprises
        total_budget: 75000,
        current_spent: 22500,
        completion_percentage: 30,
        status: 'active',
        start_date: '2024-02-01',
        deadline: '2024-05-15',
        overdue_tasks: 1
      },
      {
        title: 'E-commerce Platform',
        description: 'Online store with payment integration and inventory management',
        manager_id: 1, // John Manager
        client_id: 5,  // Tech Solutions Ltd
        total_budget: 100000,
        current_spent: 100000,
        completion_percentage: 100,
        status: 'completed',
        start_date: '2023-11-01',
        deadline: '2024-01-31',
        overdue_tasks: 0
      }
    ];

    projects.forEach(project => {
      const query = 'INSERT INTO projects (title, description, manager_id, client_id, total_budget, current_spent, completion_percentage, status, start_date, deadline, overdue_tasks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      
      db.query(query, [
        project.title, project.description, project.manager_id, project.client_id,
        project.total_budget, project.current_spent, project.completion_percentage,
        project.status, project.start_date, project.deadline, project.overdue_tasks
      ], (err, result) => {
        if (err) {
          console.log('❌ Project error:', err.message);
        } else {
          projectsCreated++;
          console.log('✅ Project:', project.title);
          
          // When all projects are created, create tasks
          if (projectsCreated === projects.length) {
            createTasks();
          }
        }
      });
    });
  }

  function createTasks() {
    console.log('📋 Creating real tasks...');
    
    const tasks = [
      // Website Redesign tasks
      { project_id: 1, title: 'Design Homepage', description: 'Create modern homepage design', status: 'completed', due_date: '2024-02-15' },
      { project_id: 1, title: 'Develop Contact Form', description: 'Build functional contact form with validation', status: 'in_progress', due_date: '2024-03-10' },
      { project_id: 1, title: 'Mobile Responsive Testing', description: 'Test on various mobile devices', status: 'pending', due_date: '2024-03-25' },
      { project_id: 1, title: 'Content Migration', description: 'Migrate existing content to new design', status: 'pending', due_date: '2024-03-20' },
      
      // Mobile App tasks
      { project_id: 2, title: 'UI/UX Design', description: 'Design app interface and user experience', status: 'completed', due_date: '2024-02-20' },
      { project_id: 2, title: 'Backend API Integration', description: 'Connect app to backend services', status: 'in_progress', due_date: '2024-04-01' },
      { project_id: 2, title: 'iOS Development', description: 'Build iOS version of the app', status: 'pending', due_date: '2024-04-15' },
      
      // E-commerce tasks (completed)
      { project_id: 3, title: 'Payment Gateway Setup', description: 'Integrate Stripe payment system', status: 'completed', due_date: '2023-12-15' },
      { project_id: 3, title: 'Product Catalog', description: 'Build product management system', status: 'completed', due_date: '2023-12-30' }
    ];

    tasks.forEach(task => {
      const query = 'INSERT INTO tasks (project_id, title, description, status, due_date) VALUES (?, ?, ?, ?, ?)';
      
      db.query(query, [
        task.project_id, task.title, task.description, task.status, task.due_date
      ], (err, result) => {
        if (err) {
          console.log('❌ Task error:', err.message);
        } else {
          tasksCreated++;
          console.log('✅ Task:', task.title);
          
          // Final completion message
          if (tasksCreated === tasks.length) {
            console.log('🎉 REAL SAMPLE DATA CREATED SUCCESSFULLY!');
            console.log('📊 You now have:');
            console.log('   👥 2 Managers, 3 Clients');
            console.log('   🏗️ 3 Real Projects (2 active, 1 completed)');
            console.log('   📋 9 Tasks with real progress');
            console.log('   💰 R225,000 total budget across projects');
            process.exit(0);
          }
        }
      });
    });
  }
};

// Run if called directly
if (require.main === module) {
  seedRealData();
}

module.exports = seedRealData;
