const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'cinga_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection with a simple query
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection error:', err.message);
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure XAMPP MySQL is running (green status)');
    console.log('   2. Check DB credentials in .env file');
    console.log('   3. Verify database name in phpMyAdmin');
  } else {
    console.log('✅ MySQL connected to database:', process.env.DB_NAME);
    
    // Test a query
    connection.query('SELECT COUNT(*) as user_count FROM users', (err, results) => {
      if (err) {
        console.error('❌ Database query test failed:', err.message);
      } else {
        console.log('✅ Database test successful - Users count:', results[0].user_count);
        console.log('🎯 Backend is ready to use!');
      }
      connection.release();
    });
  }
});

module.exports = pool;