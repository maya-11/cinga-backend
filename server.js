const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ✅ FIXED: CORS configuration at the top
app.use(cors({
  origin: ['http://localhost:8081', 'http://192.168.10.76:8081', 'exp://192.168.10.76:8081', 'http://localhost:3000'],
  credentials: true
}));

// Middleware
app.use(helmet());
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
  { path: '/api/dashboard', file: './routes/dashboardRoutes' },
  { path: '/api/manager', file: './routes/managerRoutes' }
];

routes.forEach(route => {
  try {
    console.log(`🔄 Loading ${route.path} from ${route.file}...`);
    const routeModule = require(route.file);
    console.log(`✅ ${route.path} loaded successfully`);
    app.use(route.path, routeModule);
  } catch (error) {
    console.log(`❌ ${route.path} FAILED:`, error.message);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cinga Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Basic server is working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ SIMPLIFIED: Debug routes - remove the complex route scanning
app.get('/api/debug-routes', (req, res) => {
  try {
    const availableRoutes = [
      { path: '/api/health', methods: ['GET'] },
      { path: '/api/test', methods: ['GET'] },
      { path: '/api/debug-routes', methods: ['GET'] },
      { path: '/api/auth/*', methods: ['POST', 'GET'] },
      { path: '/api/users/*', methods: ['GET', 'POST', 'PUT'] },
      { path: '/api/projects/*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      { path: '/api/tasks/*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      { path: '/api/payments/*', methods: ['GET', 'POST', 'PUT'] },
      { path: '/api/notifications/*', methods: ['GET', 'POST', 'PUT'] },
      { path: '/api/dashboard/*', methods: ['GET'] },
      { path: '/api/manager/*', methods: ['GET'] }
    ];
    
    res.json({ 
      availableRoutes: availableRoutes,
      totalRoutes: availableRoutes.length,
      message: 'Routes list generated successfully'
    });
  } catch (error) {
    console.error('Error in debug-routes:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve routes',
      message: error.message 
    });
  }
});

// ✅ FIXED: Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🆘 Global Error Handler:', err?.message || 'Unknown error');
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err?.message || 'An unknown error occurred'
  });
});

// ✅ FIXED: 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    message: `The route ${req.method} ${req.originalUrl} was not found on this server`,
    availableEndpoints: [
      '/api/health',
      '/api/test', 
      '/api/debug-routes',
      '/api/auth/*',
      '/api/users/*',
      '/api/projects/*',
      '/api/tasks/*',
      '/api/payments/*',
      '/api/notifications/*',
      '/api/dashboard/*',
      '/api/manager/*'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Network: http://192.168.10.76:${PORT}/api/health`);
  console.log(`🌐 Network: http://192.168.10.77:${PORT}/api/health`);
  console.log(`🔧 Accessible from all network interfaces`);
  console.log(`📊 Test routes: http://localhost:${PORT}/api/debug-routes`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🆘 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🆘 Unhandled Rejection at:', promise, 'reason:', reason);
});