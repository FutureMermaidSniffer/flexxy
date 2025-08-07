const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const winston = require('winston');
require('dotenv').config();

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'flexjobs' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// SECURITY: Auto-admin creation disabled for production security
// const { createAdminFromEnv } = require('./auto-create-admin');
const siteConfig = require('./backend/config/site');

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


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.yourdomain.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3003', 'http://127.0.0.1:3000', 'http://127.0.0.1:3003'];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || 100), // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60
    });
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.STRICT_RATE_LIMIT_MAX || 5), // 5 attempts per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.log(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: 15 * 60
    });
  }
});

// Apply general rate limiting to all routes
app.use('/api/', generalLimiter);

// Apply strict rate limiting to auth routes
app.use('/api/auth/', authLimiter);

// SECURITY: Session configuration with mandatory secret
if (!process.env.SESSION_SECRET) {
  console.error('❌ SECURITY ERROR: SESSION_SECRET environment variable is required');
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 
  }
}));


app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };
    
    if (res.statusCode >= 400) {
      logger.error('HTTP_ERROR', logData);
    } else if (req.originalUrl.startsWith('/api/')) {
      logger.info('API_REQUEST', logData);
    }
  });
  
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'FlexJobs');
  res.setHeader('Server', 'FlexJobs/1.0');
  next();
});

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}









app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'frontend')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Site configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    siteUrl: siteConfig.siteUrl,
    adminUrl: siteConfig.adminUrl(),
    jobsUrl: siteConfig.jobsUrl(),
    dashboardUrl: siteConfig.dashboardUrl(),
    environment: siteConfig.environment,
    isProduction: siteConfig.isProduction()
  });
});


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


app.use('/components', express.static(path.join(__dirname, 'frontend/components')));


// Clean URL routes (no .html extension)
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

app.get('/browse-jobs', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'browse-jobs.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'reset-password.html'));
});

// Add more clean URL routes for common pages
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'about.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'registration.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin-dashboard.html'));
});

app.get('/job-details', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'job-details.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dashboard.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'account.html'));
});

app.get('/faq', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'faq.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'support.html'));
});

app.get('/help', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'help.html'));
});

app.get('/career-advice', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'career-advice.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'events.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'blog.html'));
});

// Home page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Clean URL middleware - handle URLs without .html extension
app.get('*', (req, res, next) => {
  // Skip API routes and files with extensions
  if (req.path.startsWith('/api/') || req.path.includes('.') || req.path === '/') {
    return next();
  }
  
  // Try to serve the HTML file for clean URLs
  const htmlPath = path.join(__dirname, 'frontend', req.path + '.html');
  const fs = require('fs');
  
  if (fs.existsSync(htmlPath)) {
    return res.sendFile(htmlPath);
  }
  
  next();
});


app.get('/*.html', (req, res) => {
  const requestedFile = req.path;
  const filePath = path.join(__dirname, 'frontend', requestedFile);
  
  
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    
    res.status(404).sendFile(path.join(__dirname, 'frontend', '404.html'));
  }
});


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


app.use('/api/*', Error404Handler.createHandler('api'));


app.get('*', Error404Handler.createHandler('static'));


app.use((err, req, res, next) => {
  // Log error with Winston
  logger.error('SERVER_ERROR', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    headers: req.headers
  });
  
  // Send appropriate response
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
  
  // SECURITY: Auto-admin creation disabled for production security
  // Use manual admin setup script when needed
  // const { createAdminFromEnv } = require('./auto-create-admin');
  // await createAdminFromEnv();
});
