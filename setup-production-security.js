/**
 * Production Security Setup Script
 * Run this to apply security enhancements for production deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ProductionSecuritySetup {
    constructor() {
        this.changes = [];
    }

    generateSecureSecret(length = 64) {
        return crypto.randomBytes(length).toString('base64');
    }

    createProductionEnvTemplate() {
        const envTemplate = `# Production Environment Variables
# CRITICAL: Update all values before deployment

# Application
NODE_ENV=production
PORT=3000

# Security Secrets (CHANGE THESE!)
JWT_SECRET=${this.generateSecureSecret()}
SESSION_SECRET=${this.generateSecureSecret()}

# Database Configuration
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USER=your-limited-db-user
DB_PASSWORD=your-secure-db-password
DB_NAME=your_production_db
DB_SSL=true

# CORS & Frontend
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
STRICT_RATE_LIMIT_MAX=5

# Email Configuration (if used)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-app-specific-password

# Admin Creation (REMOVE AFTER FIRST USE)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=temporary-secure-password-123!

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
ERROR_LOG_FILE=logs/error.log
`;

        fs.writeFileSync('.env.production.template', envTemplate);
        console.log('✅ Created .env.production.template');
        this.changes.push('Created production environment template');
    }

    enhanceDatabaseSecurity() {
        const dbPath = path.join('backend', 'database.js');
        
        if (!fs.existsSync(dbPath)) {
            console.log('❌ Database file not found');
            return;
        }

        let dbContent = fs.readFileSync(dbPath, 'utf8');
        
        // Add SSL configuration
        const sslConfig = `
  // Add SSL for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false,`;

        if (!dbContent.includes('ssl:')) {
            dbContent = dbContent.replace(
                'connectionTimeoutMillis: 2000,',
                `connectionTimeoutMillis: 2000,${sslConfig}`
            );
            
            fs.writeFileSync(dbPath, dbContent);
            console.log('✅ Added SSL configuration to database');
            this.changes.push('Enhanced database security with SSL');
        }
    }

    createSecurityMiddleware() {
        const middlewarePath = path.join('backend', 'middleware', 'security.js');
        
        const securityMiddleware = `/**
 * Production Security Middleware
 * Additional security configurations for production
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Enhanced rate limiting
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: message,
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};

// Different rate limits for different endpoints
const rateLimiters = {
    general: createRateLimiter(
        parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
        parseInt(process.env.RATE_LIMIT_MAX || 100),
        'Too many requests from this IP, please try again later'
    ),
    
    auth: createRateLimiter(
        15 * 60 * 1000, // 15 minutes
        parseInt(process.env.STRICT_RATE_LIMIT_MAX || 5),
        'Too many authentication attempts, please try again later'
    ),
    
    strict: createRateLimiter(
        15 * 60 * 1000, // 15 minutes
        parseInt(process.env.STRICT_RATE_LIMIT_MAX || 5),
        'Too many attempts, please try again later'
    )
};

// Enhanced helmet configuration
const helmetConfig = {
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
            frameSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: process.env.NODE_ENV === 'production' ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    } : false
};

// HTTPS redirect middleware
const httpsRedirect = (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
        return res.redirect(301, \`https://\${req.header('host')}\${req.url}\`);
    }
    next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Powered-By', 'FlexJobs');
    res.setHeader('Server', 'FlexJobs');
    next();
};

// IP whitelist middleware (optional)
const ipWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
        if (allowedIPs.length === 0) return next();
        
        const clientIP = req.ip || req.connection.remoteAddress;
        if (allowedIPs.includes(clientIP)) {
            next();
        } else {
            res.status(403).json({ error: 'Access denied' });
        }
    };
};

module.exports = {
    rateLimiters,
    helmetConfig,
    httpsRedirect,
    securityHeaders,
    ipWhitelist
};
`;

        // Create middleware directory if it doesn't exist
        const middlewareDir = path.join('backend', 'middleware');
        if (!fs.existsSync(middlewareDir)) {
            fs.mkdirSync(middlewareDir, { recursive: true });
        }

        fs.writeFileSync(middlewarePath, securityMiddleware);
        console.log('✅ Created security middleware');
        this.changes.push('Created comprehensive security middleware');
    }

    createLoggingSetup() {
        const loggingPath = path.join('backend', 'utils', 'logger.js');
        
        const loggingSetup = `/**
 * Production Logging Configuration
 * Secure logging for production environment
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for security logs
const securityFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = \`\${timestamp} [\${level.toUpperCase()}]: \${message}\`;
        
        if (Object.keys(meta).length) {
            log += \` \${JSON.stringify(meta)}\`;
        }
        
        if (stack) {
            log += \`\\n\${stack}\`;
        }
        
        return log;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: securityFormat,
    defaultMeta: { service: 'flexjobs' },
    transports: [
        // Error log file
        new winston.transports.File({
            filename: process.env.ERROR_LOG_FILE || 'logs/error.log',
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            tailable: true
        }),
        
        // Combined log file
        new winston.transports.File({
            filename: process.env.LOG_FILE || 'logs/combined.log',
            maxsize: 10485760, // 10MB
            maxFiles: 10,
            tailable: true
        }),
        
        // Console output (only in development)
        ...(process.env.NODE_ENV !== 'production' ? [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        ] : [])
    ]
});

// Security event logging
const logSecurityEvent = (event, req, additionalData = {}) => {
    const securityLog = {
        event,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        ...additionalData
    };
    
    logger.warn('SECURITY_EVENT', securityLog);
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: \`\${duration}ms\`,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        if (res.statusCode >= 400) {
            logger.error('HTTP_ERROR', logData);
        } else {
            logger.info('HTTP_REQUEST', logData);
        }
    });
    
    next();
};

module.exports = {
    logger,
    logSecurityEvent,
    requestLogger
};
`;

        // Create utils directory if it doesn't exist
        const utilsDir = path.join('backend', 'utils');
        if (!fs.existsSync(utilsDir)) {
            fs.mkdirSync(utilsDir, { recursive: true });
        }

        fs.writeFileSync(loggingPath, loggingSetup);
        console.log('✅ Created logging configuration');
        this.changes.push('Created production logging system');
    }

    createSecurityAuditScript() {
        const auditScript = `#!/usr/bin/env node
/**
 * Security Audit Script
 * Run regular security checks on the application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityAuditor {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.passed = [];
    }

    checkEnvironmentVariables() {
        console.log('🔍 Checking environment variables...');
        
        const requiredVars = [
            'NODE_ENV',
            'JWT_SECRET',
            'SESSION_SECRET',
            'DB_PASSWORD'
        ];
        
        const recommendedVars = [
            'ALLOWED_ORIGINS',
            'RATE_LIMIT_MAX',
            'DB_SSL'
        ];

        requiredVars.forEach(varName => {
            if (!process.env[varName]) {
                this.issues.push(\`Missing required environment variable: \${varName}\`);
            } else {
                this.passed.push(\`Environment variable \${varName} is set\`);
            }
        });

        recommendedVars.forEach(varName => {
            if (!process.env[varName]) {
                this.warnings.push(\`Recommended environment variable not set: \${varName}\`);
            }
        });

        // Check JWT secret strength
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
            this.issues.push('JWT_SECRET is too short (minimum 32 characters recommended)');
        }
    }

    checkFilePermissions() {
        console.log('🔍 Checking file permissions...');
        
        const sensitiveFiles = ['.env', '.env.production', 'logs/'];
        
        sensitiveFiles.forEach(file => {
            if (fs.existsSync(file)) {
                try {
                    const stats = fs.statSync(file);
                    const permissions = (stats.mode & parseInt('777', 8)).toString(8);
                    
                    if (file.includes('.env') && permissions !== '600') {
                        this.warnings.push(\`File \${file} has permissions \${permissions}, should be 600\`);
                    } else {
                        this.passed.push(\`File \${file} permissions OK\`);
                    }
                } catch (err) {
                    this.warnings.push(\`Could not check permissions for \${file}\`);
                }
            }
        });
    }

    checkDependencyVulnerabilities() {
        console.log('🔍 Checking for dependency vulnerabilities...');
        
        try {
            const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
            const audit = JSON.parse(auditResult);
            
            if (audit.metadata.vulnerabilities.total > 0) {
                this.issues.push(\`Found \${audit.metadata.vulnerabilities.total} dependency vulnerabilities\`);
                
                Object.entries(audit.metadata.vulnerabilities).forEach(([severity, count]) => {
                    if (count > 0 && severity !== 'total') {
                        this.warnings.push(\`\${count} \${severity} severity vulnerabilities\`);
                    }
                });
            } else {
                this.passed.push('No known dependency vulnerabilities');
            }
        } catch (err) {
            this.warnings.push('Could not run npm audit');
        }
    }

    checkSecurityHeaders() {
        console.log('🔍 Checking security configurations...');
        
        // Check if helmet is configured
        const serverPath = 'server.js';
        if (fs.existsSync(serverPath)) {
            const serverContent = fs.readFileSync(serverPath, 'utf8');
            
            if (serverContent.includes('helmet')) {
                this.passed.push('Helmet security middleware is configured');
            } else {
                this.issues.push('Helmet security middleware not found');
            }
            
            if (serverContent.includes('rateLimit')) {
                this.passed.push('Rate limiting is configured');
            } else {
                this.issues.push('Rate limiting not configured');
            }
            
            if (serverContent.includes('cors')) {
                this.passed.push('CORS is configured');
            } else {
                this.issues.push('CORS not configured');
            }
        }
    }

    generateReport() {
        console.log('\\n📋 Security Audit Report');
        console.log('========================\\n');
        
        if (this.issues.length > 0) {
            console.log('🚨 Critical Issues:');
            this.issues.forEach(issue => console.log(\`  ❌ \${issue}\`));
            console.log('');
        }
        
        if (this.warnings.length > 0) {
            console.log('⚠️  Warnings:');
            this.warnings.forEach(warning => console.log(\`  ⚠️  \${warning}\`));
            console.log('');
        }
        
        if (this.passed.length > 0) {
            console.log('✅ Passed Checks:');
            this.passed.forEach(pass => console.log(\`  ✅ \${pass}\`));
            console.log('');
        }
        
        const score = (this.passed.length / (this.passed.length + this.warnings.length + this.issues.length)) * 100;
        console.log(\`🎯 Security Score: \${Math.round(score)}%\\n\`);
        
        if (this.issues.length > 0) {
            console.log('🔧 Recommended Actions:');
            console.log('  1. Fix all critical issues before production deployment');
            console.log('  2. Address warnings to improve security posture');
            console.log('  3. Run this audit regularly');
            console.log('  4. Keep dependencies updated');
            console.log('  5. Monitor logs for security events\\n');
        }
        
        return this.issues.length === 0;
    }

    run() {
        console.log('🔒 Starting Security Audit...\\n');
        
        this.checkEnvironmentVariables();
        this.checkFilePermissions();
        this.checkDependencyVulnerabilities();
        this.checkSecurityHeaders();
        
        return this.generateReport();
    }
}

// Run audit if called directly
if (require.main === module) {
    const auditor = new SecurityAuditor();
    const passed = auditor.run();
    process.exit(passed ? 0 : 1);
}

module.exports = SecurityAuditor;
`;

        fs.writeFileSync('security-audit.js', auditScript);
        fs.chmodSync('security-audit.js', '755');
        console.log('✅ Created security audit script');
        this.changes.push('Created security audit script');
    }

    run() {
        console.log('🔒 Setting up production security enhancements...\n');

        try {
            this.createProductionEnvTemplate();
            this.enhanceDatabaseSecurity();
            this.createSecurityMiddleware();
            this.createLoggingSetup();
            this.createSecurityAuditScript();

            console.log('\n✅ Production security setup complete!\n');
            console.log('📋 Changes made:');
            this.changes.forEach(change => console.log(`  • ${change}`));
            
            console.log('\n🚀 Next steps:');
            console.log('  1. Copy .env.production.template to .env.production');
            console.log('  2. Update all values in .env.production');
            console.log('  3. Install additional dependencies: npm install winston');
            console.log('  4. Update server.js to use new security middleware');
            console.log('  5. Run security audit: node security-audit.js');
            console.log('  6. Set up SSL certificates');
            console.log('  7. Configure reverse proxy (Nginx/Apache)');
            console.log('  8. Set up monitoring and alerting');

        } catch (error) {
            console.error('❌ Error during security setup:', error.message);
        }
    }
}

// Run if called directly
if (require.main === module) {
    const setup = new ProductionSecuritySetup();
    setup.run();
}

module.exports = ProductionSecuritySetup;
