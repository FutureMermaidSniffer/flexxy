#!/usr/bin/env node
/**
 * PRODUCTION ENVIRONMENT VALIDATOR
 * 
 * Validates that all required environment variables are set
 * and meet security requirements for production deployment.
 * 
 * Usage: node scripts/validate-production-env.js
 */

const crypto = require('crypto');

class ProductionEnvValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.requiredVars = [
            'NODE_ENV',
            'DB_HOST',
            'DB_PORT', 
            'DB_NAME',
            'DB_USER',
            'DB_PASSWORD',
            'SESSION_SECRET',
            'JWT_SECRET',
            'SITE_URL'
        ];
    }

    validateRequired() {
        console.log('🔍 Checking required environment variables...');
        
        for (const varName of this.requiredVars) {
            if (!process.env[varName]) {
                this.errors.push(`❌ Missing required variable: ${varName}`);
            } else {
                console.log(`✅ ${varName} is set`);
            }
        }
    }

    validateSecrets() {
        console.log('\n🔐 Validating secret strength...');
        
        // JWT Secret validation
        if (process.env.JWT_SECRET) {
            if (process.env.JWT_SECRET.length < 64) {
                this.errors.push('❌ JWT_SECRET must be at least 64 characters long');
            } else if (this.isWeakSecret(process.env.JWT_SECRET)) {
                this.warnings.push('⚠️  JWT_SECRET appears to be weak (use random generator)');
            } else {
                console.log('✅ JWT_SECRET strength is adequate');
            }
        }

        // Session Secret validation
        if (process.env.SESSION_SECRET) {
            if (process.env.SESSION_SECRET.length < 64) {
                this.errors.push('❌ SESSION_SECRET must be at least 64 characters long');
            } else if (this.isWeakSecret(process.env.SESSION_SECRET)) {
                this.warnings.push('⚠️  SESSION_SECRET appears to be weak (use random generator)');
            } else {
                console.log('✅ SESSION_SECRET strength is adequate');
            }
        }

        // Database Password validation
        if (process.env.DB_PASSWORD) {
            if (process.env.DB_PASSWORD.length < 16) {
                this.errors.push('❌ DB_PASSWORD must be at least 16 characters long');
            } else if (this.isCommonPassword(process.env.DB_PASSWORD)) {
                this.errors.push('❌ DB_PASSWORD is too common/weak');
            } else {
                console.log('✅ DB_PASSWORD strength is adequate');
            }
        }
    }

    validateEnvironment() {
        console.log('\n🌍 Validating environment configuration...');
        
        if (process.env.NODE_ENV !== 'production') {
            this.errors.push('❌ NODE_ENV must be set to "production"');
        } else {
            console.log('✅ NODE_ENV is set to production');
        }

        // Database port validation (using consistent 5433)
        if (process.env.DB_PORT && process.env.DB_PORT !== '5433') {
            this.warnings.push('⚠️  DB_PORT should be 5433 for consistency (avoiding default 5432)');
        } else if (process.env.DB_PORT === '5433') {
            console.log('✅ DB_PORT using secure non-default port 5433');
        }

        // Site URL validation
        if (process.env.SITE_URL) {
            if (!process.env.SITE_URL.startsWith('https://')) {
                this.errors.push('❌ SITE_URL must use HTTPS in production');
            } else {
                console.log('✅ SITE_URL uses HTTPS');
            }
        }
    }

    validateSecurityFeatures() {
        console.log('\n🛡️  Checking security features...');
        
        // Check for development secrets in production
        const devSecrets = [
            'dev-super-secret-session-key-here',
            'dev_super_secret_jwt_key_here',
            'fallback-secret-key',
            'your-super-secret',
            'admin123',
            'password',
            'postgres'
        ];

        for (const envVar in process.env) {
            for (const devSecret of devSecrets) {
                if (process.env[envVar].includes(devSecret)) {
                    this.errors.push(`❌ Development secret found in ${envVar}: contains "${devSecret}"`);
                }
            }
        }

        // Admin password check
        if (process.env.ADMIN_PASSWORD) {
            this.warnings.push('⚠️  ADMIN_PASSWORD is set - remove after initial setup');
        }
    }

    isWeakSecret(secret) {
        // Check for common patterns
        const weakPatterns = [
            /^[a-zA-Z]+$/,  // Only letters
            /^[0-9]+$/,     // Only numbers
            /password/i,
            /secret/i,
            /admin/i,
            /test/i,
            /dev/i
        ];

        return weakPatterns.some(pattern => pattern.test(secret));
    }

    isCommonPassword(password) {
        const commonPasswords = [
            'password', 'postgres', 'admin', 'root', '123456',
            'password123', 'admin123', 'qwerty', 'welcome',
            '11223344', 'change-me', 'default'
        ];

        return commonPasswords.some(common => 
            password.toLowerCase().includes(common.toLowerCase())
        );
    }

    generateSecureExample() {
        console.log('\n🔧 Example secure secrets:');
        console.log('Generate with these commands:');
        console.log('');
        console.log('# JWT Secret (64+ chars)');
        console.log(`JWT_SECRET="${crypto.randomBytes(48).toString('base64')}"`);
        console.log('');
        console.log('# Session Secret (64+ chars)');
        console.log(`SESSION_SECRET="${crypto.randomBytes(48).toString('base64')}"`);
        console.log('');
        console.log('# Database Password (32+ chars)');
        console.log(`DB_PASSWORD="${crypto.randomBytes(24).toString('base64')}"`);
    }

    run() {
        console.log('🚀 PRODUCTION ENVIRONMENT VALIDATION');
        console.log('====================================');
        
        this.validateRequired();
        this.validateSecrets();
        this.validateEnvironment();
        this.validateSecurityFeatures();

        console.log('\n📊 VALIDATION RESULTS');
        console.log('=====================');
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('🎉 ALL CHECKS PASSED - Environment is production-ready!');
            return true;
        }

        if (this.errors.length > 0) {
            console.log('\n💥 CRITICAL ERRORS (Must Fix):');
            this.errors.forEach(error => console.log(error));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS (Recommended):');
            this.warnings.forEach(warning => console.log(warning));
        }

        if (this.errors.length > 0) {
            console.log('\n❌ Environment is NOT ready for production!');
            this.generateSecureExample();
            process.exit(1);
        } else {
            console.log('\n⚠️  Environment has warnings but is deployable');
            return true;
        }
    }
}

// Run validation
const validator = new ProductionEnvValidator();
validator.run();
