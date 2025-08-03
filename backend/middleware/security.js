/**
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
        return res.redirect(301, `https://${req.header('host')}${req.url}`);
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
