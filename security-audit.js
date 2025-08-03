#!/usr/bin/env node
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
                this.issues.push(`Missing required environment variable: ${varName}`);
            } else {
                this.passed.push(`Environment variable ${varName} is set`);
            }
        });

        recommendedVars.forEach(varName => {
            if (!process.env[varName]) {
                this.warnings.push(`Recommended environment variable not set: ${varName}`);
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
                        this.warnings.push(`File ${file} has permissions ${permissions}, should be 600`);
                    } else {
                        this.passed.push(`File ${file} permissions OK`);
                    }
                } catch (err) {
                    this.warnings.push(`Could not check permissions for ${file}`);
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
                this.issues.push(`Found ${audit.metadata.vulnerabilities.total} dependency vulnerabilities`);
                
                Object.entries(audit.metadata.vulnerabilities).forEach(([severity, count]) => {
                    if (count > 0 && severity !== 'total') {
                        this.warnings.push(`${count} ${severity} severity vulnerabilities`);
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
        console.log('\n📋 Security Audit Report');
        console.log('========================\n');
        
        if (this.issues.length > 0) {
            console.log('🚨 Critical Issues:');
            this.issues.forEach(issue => console.log(`  ❌ ${issue}`));
            console.log('');
        }
        
        if (this.warnings.length > 0) {
            console.log('⚠️  Warnings:');
            this.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
            console.log('');
        }
        
        if (this.passed.length > 0) {
            console.log('✅ Passed Checks:');
            this.passed.forEach(pass => console.log(`  ✅ ${pass}`));
            console.log('');
        }
        
        const score = (this.passed.length / (this.passed.length + this.warnings.length + this.issues.length)) * 100;
        console.log(`🎯 Security Score: ${Math.round(score)}%\n`);
        
        if (this.issues.length > 0) {
            console.log('🔧 Recommended Actions:');
            console.log('  1. Fix all critical issues before production deployment');
            console.log('  2. Address warnings to improve security posture');
            console.log('  3. Run this audit regularly');
            console.log('  4. Keep dependencies updated');
            console.log('  5. Monitor logs for security events\n');
        }
        
        return this.issues.length === 0;
    }

    run() {
        console.log('🔒 Starting Security Audit...\n');
        
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
