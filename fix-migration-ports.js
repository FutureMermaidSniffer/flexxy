#!/usr/bin/env node

/**
 * Migration Port Fix Script
 * Updates all database migration files to use consistent port 5433
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Database Port Configuration in Migration Files...\n');

const migrationFiles = [
    // Core migration files
    'database/migration-system.js',
    'database/transition-migrations.js',
    'database/create-admin-user.js',
    'database/run-password-reset-migration.js',
    'database/run-oauth-migration.js',
    'database/run-interactions-migration.js',
    'database/run-wizard-migration.js',
    
    // Individual migration files
    'database/migrations/add-tags-column.js',
    'database/migrations/add-salary-type-column.js',
    'database/migrations/migrate.js',
    
    // Additional utility files
    'database/add-more-agents.js'
];

let fixedFiles = 0;
let errors = 0;

// Function to fix port in a file
function fixPortInFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        // Fix port 5432 to 5433
        if (content.includes('process.env.DB_PORT || 5432')) {
            content = content.replace(/process\.env\.DB_PORT \|\| 5432/g, 'process.env.DB_PORT || 5433');
            modified = true;
        }
        
        // Remove hardcoded postgres password fallbacks (for security)
        if (content.includes("process.env.DB_PASSWORD || 'postgres'")) {
            content = content.replace(/process\.env\.DB_PASSWORD \|\| 'postgres'/g, 'process.env.DB_PASSWORD');
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Fixed: ${filePath}`);
            fixedFiles++;
            return true;
        } else {
            console.log(`ℹ️  No changes needed: ${filePath}`);
            return true;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        errors++;
        return false;
    }
}

// Process all migration files
console.log('🚀 Processing migration files...\n');

migrationFiles.forEach(file => {
    fixPortInFile(file);
});

// Summary
console.log('\n📊 Summary:');
console.log(`✅ Files processed successfully: ${fixedFiles + (migrationFiles.length - fixedFiles - errors)}`);
console.log(`🔧 Files modified: ${fixedFiles}`);
console.log(`❌ Errors encountered: ${errors}`);

if (errors === 0) {
    console.log('\n🎉 All migration files have been updated!');
    console.log('🔒 Port configuration is now consistent (5433)');
    console.log('🛡️  Hardcoded passwords have been removed');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with DB_PORT=5433');
    console.log('2. Ensure DB_PASSWORD is set in environment');
    console.log('3. Run docker-compose up to test the new configuration');
} else {
    console.log('\n⚠️  Some errors occurred. Please review the output above.');
    process.exit(1);
}
