#!/usr/bin/env node

/**
 * Docker Security Validation Script
 * Validates Phase 3 security configuration for production deployment
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔍 Validating Docker Security Configuration...\n');

// Read docker-compose.yml
const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
let dockerConfig = '';
let validationPassed = true;
const issues = [];
const passed = [];

try {
    dockerConfig = fs.readFileSync(dockerComposePath, 'utf8');
} catch (error) {
    console.error('❌ Cannot read docker-compose.yml:', error.message);
    process.exit(1);
}

// Check migration files for port consistency
async function checkMigrationFiles() {
    const migrationIssues = [];
    const migrationPassed = [];
    
    try {
        const migrationFiles = [
            'database/migrate.js',
            'database/migrate-production.js', 
            'database/enhanced-migrations.js',
            'database/snapshot-database.js',
            'database/run-password-reset-migration.js',
            'database/run-job-management-migration.js',
            'database/run-agents-migration.js',
            'database/rollback.js',
            'database/add-scraping-fields.js',
            'database/migrations/migrate.js',
            'database/migrations/add-tags-column.js',
            'database/migrations/add-salary-type-column.js'
        ];

        for (const file of migrationFiles) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Check for port 5432 (should be 5433)
                if (content.includes('5432')) {
                    migrationIssues.push(`❌ ${file}: Still uses port 5432 instead of 5433`);
                } else if (content.includes('5433')) {
                    migrationPassed.push(`✅ ${file}: Uses correct port 5433`);
                }
                
                // Check for hardcoded postgres passwords
                if (content.includes("'postgres'") && content.includes('password')) {
                    migrationIssues.push(`❌ ${file}: Contains hardcoded 'postgres' password`);
                }
            }
        }
    } catch (error) {
        console.log('⚠️  Could not check migration files:', error.message);
    }
    
    return { migrationIssues, migrationPassed };
}

// Security checks
const checks = [
    {
        name: 'Production Environment',
        test: () => dockerConfig.includes('NODE_ENV=production'),
        description: 'Application should run in production mode'
    },
    {
        name: 'Database Port Security',
        test: () => !dockerConfig.includes('5432:5432') && dockerConfig.includes('expose:\n      - "5433"'),
        description: 'Database should not expose standard port publicly'
    },
    {
        name: 'Redis Port Security', 
        test: () => !dockerConfig.includes('6379:6379') && dockerConfig.includes('expose:\n      - "6379"'),
        description: 'Redis should not expose port publicly'
    },
    {
        name: 'Custom Database Port',
        test: () => dockerConfig.includes('DB_PORT=5433') && dockerConfig.includes('postgres -p 5433'),
        description: 'Database should run on custom port 5433'
    },
    {
        name: 'No Hardcoded Secrets',
        test: () => !dockerConfig.includes('admin123') && 
                   !dockerConfig.includes('dev_jwt_secret') && 
                   !dockerConfig.includes('dev_session_secret') &&
                   !dockerConfig.includes(':-postgres'),
        description: 'No hardcoded passwords or secrets should be present'
    },
    {
        name: 'Required Environment Variables',
        test: () => dockerConfig.includes('SESSION_SECRET=${SESSION_SECRET}') &&
                   dockerConfig.includes('JWT_SECRET=${JWT_SECRET}') &&
                   dockerConfig.includes('DB_PASSWORD=${DB_PASSWORD}'),
        description: 'All critical secrets should require environment variables'
    },
    {
        name: 'Health Check Port',
        test: () => dockerConfig.includes('pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-flexjobs_db} -p 5433'),
        description: 'Health checks should use correct port'
    }
];

// Run all checks
async function runValidation() {
    // Docker configuration checks
    checks.forEach(check => {
        if (check.test()) {
            passed.push(`✅ ${check.name}: ${check.description}`);
        } else {
            issues.push(`❌ ${check.name}: ${check.description}`);
            validationPassed = false;
        }
    });
    
    // Migration files checks
    const { migrationIssues, migrationPassed } = await checkMigrationFiles();
    
    // Add migration results to main results
    passed.push(...migrationPassed);
    issues.push(...migrationIssues);
    
    if (migrationIssues.length > 0) {
        validationPassed = false;
    }

    // Display results
    console.log('📋 Security Validation Results:\n');

    if (passed.length > 0) {
        console.log('🎉 Passed Checks:');
        passed.forEach(item => console.log(`  ${item}`));
        console.log('');
    }

    if (issues.length > 0) {
        console.log('⚠️  Issues Found:');
        issues.forEach(item => console.log(`  ${item}`));
        console.log('');
    }

    // Summary
    if (validationPassed) {
        console.log('🎯 Phase 3 Docker Security: PASSED');
        console.log('✅ All security configurations are properly implemented');
        console.log('🔒 Database and Redis are not publicly accessible');
        console.log('📦 Migration files use consistent port 5433');
        console.log('🚀 Ready for production deployment');
    } else {
        console.log('❌ Phase 3 Docker Security: FAILED');
        console.log('⚠️  Please fix the issues above before production deployment');
    }

    console.log('\n📝 Phase 3 Security Implementation Summary:');
    console.log('• Changed NODE_ENV from development to production');
    console.log('• Moved database from port 5432 to custom port 5433');
    console.log('• Removed public port exposure for PostgreSQL and Redis');
    console.log('• Eliminated all hardcoded passwords and secrets');
    console.log('• Added mandatory environment variable requirements');
    console.log('• Updated health checks for new port configuration');
    console.log('• Fixed all migration files to use consistent port 5433');

    process.exit(validationPassed ? 0 : 1);
}

runValidation();
