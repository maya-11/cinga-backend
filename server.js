const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Test routes one by one
console.log('🔍 Loading routes...');

const routes = [
  { path: '/api/auth', file: './routes/authRoutes' },
  { path: '/api/users', file: './routes/userRoutes' },
  { path: '/api/projects', file: './routes/projectRoutes' },
  { path: '/api/tasks', file: './routes/taskRoutes' },
  { path: '/api/payments', file: './routes/paymentRoutes' },
  { path: '/api/notifications', file: './routes/notificationRoutes' },
  { path: '/api/dashboard', file: './routes/dashboardRoutes' }
];

routes.forEach(route => {
  try {
    console.log(`🔄 Loading ${route.path} from ${route.file}...`);
    const routeModule = require(route.file);
    console.log(`✅ ${route.path} loaded successfully`);
    app.use(route.path, routeModule);
  } catch (error) {
    console.log(`❌ ${route.path} FAILED:`, error.message);
    console.log(`   Error details:`, error.stack);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cinga Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Basic server is working!',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
});