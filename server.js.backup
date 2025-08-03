const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
require('dotenv').config();

// Auto admin creation (optional)
const { createAdminFromEnv } = require('./auto-create-admin');

// Updated admin endpoints - fixed column issues
const authRoutes = require('./backend/routes/auth');
const jobRoutes = require('./backend/routes/jobs');
const companyRoutes = require('./backend/routes/companies');
const userRoutes = require('./backend/routes/users');
const applicationRoutes = require('./backend/routes/applications');
const agentRoutes = require('./backend/routes/agents');
const subscriptionRoutes = require('./backend/routes/subscriptions');
const paymentMethodRoutes = require('./backend/routes/payment-methods');
const adminRoutes = require('./backend/routes/admin');
const interactionRoutes = require('./backend/routes/interactions');
const Error404Handler = require('./backend/middleware/404-handler');

const app = express();
const PORT = process.env.PORT || 3003;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://appleid.cdn-apple.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://appleid.apple.com"]
    }
  }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3003',
  credentials: true
}));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interactions', interactionRoutes);

// Serve component files
app.use('/components', express.static(path.join(__dirname, 'frontend/components')));

// Specific page routes
app.get('/why-remote', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'why-remote.html'));
});

app.get('/salary-preference', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'salary-preference.html'));
});

app.get('/where-remote', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'where-remote.html'));
});

app.get('/what-job', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'what-job.html'));
});

app.get('/job-category', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'job-category.html'));
});

app.get('/relevant-experience', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'relevant-experience.html'));
});

app.get('/education-level', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'education-level.html'));
});

app.get('/benefits', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'benefits.html'));
});

app.get('/upload-resume', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'upload-resume.html'));
});

app.get('/remote-jobs', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'remote-jobs.html'));
});

// Handle specific HTML file requests
app.get('/*.html', (req, res) => {
  const requestedFile = req.path;
  const filePath = path.join(__dirname, 'frontend', requestedFile);
  
  // Check if file exists
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // File doesn't exist, serve 404 page
    res.status(404).sendFile(path.join(__dirname, 'frontend', '404.html'));
  }
});

// Handle component requests
app.get('/components/*', (req, res, next) => {
  const requestedPath = req.path.replace('/components/', '');
  const filePath = path.join(__dirname, 'frontend', 'components', requestedPath);
  
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Component not found' });
  }
});

// Handle API 404s
app.use('/api/*', Error404Handler.createHandler('api'));

// Handle asset requests (images, css, js, etc.)
app.get('*', Error404Handler.createHandler('static'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  // Log error details for debugging
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  console.error('Request Headers:', req.headers);
  
  // Check if it's an API request
  if (req.originalUrl.startsWith('/api/')) {
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
  } else {
    // For non-API requests, serve 404 page
    res.status(500).sendFile(path.join(__dirname, 'frontend', '404.html'));
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Agents page search functionality should now work properly
  
  // Auto-create admin user if environment variables are set
  const { createAdminFromEnv } = require('./auto-create-admin');
  await createAdminFromEnv();
});
