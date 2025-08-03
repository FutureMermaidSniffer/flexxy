# 🔒 FlexJobs Production Security Guide

## Critical Security Configurations

### 1. Environment Variables (Required)
```bash
# CRITICAL: Change these for production
NODE_ENV=production
JWT_SECRET=your-super-long-random-secret-minimum-64-characters-recommended
SESSION_SECRET=different-super-long-random-secret-for-sessions

# Database (Use strong credentials)
DB_HOST=your-production-db-host
DB_USER=limited-permissions-db-user
DB_PASSWORD=strong-database-password-with-special-chars
DB_NAME=your_production_db
DB_SSL=true  # Enable SSL for database connections

# CORS (Restrict to your domain)
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
STRICT_RATE_LIMIT_MAX=5  # For sensitive endpoints

# Email/SMTP (if used)
SMTP_HOST=your-smtp-provider
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email
SMTP_PASS=your-app-specific-password

# Admin Creation (Remove after first use)
ADMIN_EMAIL=your-admin@yourdomain.com
ADMIN_PASSWORD=temporary-secure-password-change-after-login
```

### 2. Database Security Enhancements Needed

#### A. SSL Connection
Update `backend/database.js`:
```javascript
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'flexjobs_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Add SSL for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false  // Set to true if you have proper certs
  } : false
};
```

#### B. Database User Permissions
- Create a dedicated database user with limited permissions
- Grant only necessary permissions (SELECT, INSERT, UPDATE, DELETE)
- Avoid using database admin/root user

### 3. Server Security Hardening

#### A. Enhanced Helmet Configuration
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### B. Strict CORS Configuration
```javascript
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 4. Authentication & Authorization Security

#### A. JWT Security
- Use long, random JWT secrets (64+ characters)
- Set appropriate expiration times
- Implement token refresh mechanism
- Store tokens securely (httpOnly cookies in production)

#### B. Password Security
- ✅ Already using bcrypt with salt rounds 12
- Consider increasing to 14-16 for higher security
- Implement password complexity requirements
- Add password breach checking (HaveIBeenPwned API)

### 5. Rate Limiting & DDoS Protection

#### A. Enhanced Rate Limiting
```javascript
// General rate limit
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || 100),
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true,
});

app.use('/api/auth/', authLimiter);
app.use('/api/', generalLimiter);
```

### 6. Input Validation & Sanitization

#### A. Enhanced Validation Middleware
- ✅ Already using express-validator
- Add input sanitization
- Implement file upload restrictions
- Validate all user inputs server-side

#### B. SQL Injection Prevention
- ✅ Already using parameterized queries
- Never concatenate user input into SQL strings
- Use ORM/query builder for complex queries

### 7. File Upload Security (If Applicable)
```javascript
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow specific file types
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

### 8. Logging & Monitoring

#### A. Security Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Log security events
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});
```

### 9. HTTPS & SSL/TLS

#### A. Force HTTPS in Production
```javascript
// Redirect HTTP to HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 10. Error Handling & Information Disclosure

#### A. Secure Error Responses
```javascript
app.use((err, req, res, next) => {
  // Log error details server-side
  console.error('Error:', err);
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: 'Internal server error' });
  } else {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});
```

### 11. Security Headers Checklist
- ✅ Helmet (basic protection)
- ❗ HSTS (force HTTPS)
- ❗ X-Frame-Options (prevent clickjacking)
- ❗ X-Content-Type-Options (prevent MIME sniffing)
- ❗ Referrer-Policy (control referrer information)

### 12. Regular Security Maintenance

#### A. Dependency Security
```bash
# Regular security audits
npm audit
npm audit fix

# Use tools like Snyk
npm install -g snyk
snyk test
snyk monitor
```

#### B. Database Maintenance
- Regular backups with encryption
- Database user permission audits
- Connection monitoring
- Query performance monitoring

### 13. Infrastructure Security

#### A. Server Hardening
- Disable unused services
- Regular OS updates
- Firewall configuration
- SSH key-based authentication only
- Fail2ban for intrusion prevention

#### B. Reverse Proxy (Nginx/Apache)
```nginx
# Sample Nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚨 Pre-Launch Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable database SSL connections
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS with valid SSL certificates
- [ ] Implement comprehensive logging
- [ ] Set up monitoring and alerting
- [ ] Run security audit tools
- [ ] Penetration testing
- [ ] Backup and disaster recovery plan
- [ ] Create incident response plan
- [ ] Document security procedures
- [ ] Train team on security practices

## 🔧 Quick Security Setup Script

Create a production setup script to automate security configurations:

```bash
#!/bin/bash
# production-setup.sh

echo "🔒 Setting up production security..."

# Install security tools
npm install --save winston helmet express-rate-limit cors dotenv

# Create logs directory
mkdir -p logs

# Set secure file permissions
chmod 600 .env
chmod -R 755 public/
chmod -R 644 logs/

# Generate secure secrets
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env.production
echo "SESSION_SECRET=$(openssl rand -base64 64)" >> .env.production

echo "✅ Basic security setup complete!"
echo "⚠️  Don't forget to:"
echo "   - Set up SSL certificates"
echo "   - Configure firewall"
echo "   - Set up monitoring"
echo "   - Review all environment variables"
```

## 📋 Security Testing Commands

```bash
# Test for common vulnerabilities
npm audit
npm audit fix

# Check for outdated packages
npm outdated

# Security scan with Snyk
npx snyk test

# Test SSL configuration
curl -I https://yourdomain.com

# Test rate limiting
for i in {1..10}; do curl -I http://localhost:3000/api/jobs; done
```

Remember: Security is an ongoing process, not a one-time setup. Regular updates, monitoring, and security reviews are essential!
