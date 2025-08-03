/**
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
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(meta).length) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        if (stack) {
            log += `\n${stack}`;
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
            duration: `${duration}ms`,
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
