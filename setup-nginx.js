#!/usr/bin/env node

/**
 * Nginx Setup and Validation Script
 * Validates Nginx configuration and sets up the environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌐 Setting up Nginx for FlexJobs Platform...\n');

let validationPassed = true;
const issues = [];
const passed = [];

// 1. Check if required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
    'nginx/nginx.conf',
    'docker-compose.nginx.yml',
    'generate-ssl-certs.ps1'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        passed.push(`✅ ${file} exists`);
    } else {
        issues.push(`❌ ${file} missing`);
        validationPassed = false;
    }
});

// 2. Check Nginx configuration syntax (if we can)
console.log('🔧 Checking Nginx configuration...');
try {
    const nginxConfig = fs.readFileSync('nginx/nginx.conf', 'utf8');
    
    if (nginxConfig.includes('upstream flexjobs_app')) {
        passed.push('✅ Upstream configuration present');
    } else {
        issues.push('❌ Upstream configuration missing');
        validationPassed = false;
    }
    
    if (nginxConfig.includes('ssl_certificate')) {
        passed.push('✅ SSL configuration present');
    } else {
        issues.push('❌ SSL configuration missing');
        validationPassed = false;
    }
    
    if (nginxConfig.includes('location /api/')) {
        passed.push('✅ API proxy configuration present');
    } else {
        issues.push('❌ API proxy configuration missing');
        validationPassed = false;
    }
    
    if (nginxConfig.includes('gzip on')) {
        passed.push('✅ Compression enabled');
    } else {
        issues.push('❌ Compression not configured');
        validationPassed = false;
    }
    
} catch (error) {
    issues.push('❌ Cannot read Nginx configuration');
    validationPassed = false;
}

// 3. Check Docker Compose Nginx configuration
console.log('🐳 Checking Docker Compose configuration...');
try {
    const dockerConfig = fs.readFileSync('docker-compose.nginx.yml', 'utf8');
    
    if (dockerConfig.includes('flexjobs-nginx:')) {
        passed.push('✅ Nginx service defined');
    } else {
        issues.push('❌ Nginx service not defined');
        validationPassed = false;
    }
    
    if (dockerConfig.includes('"80:80"') && dockerConfig.includes('"443:443"')) {
        passed.push('✅ HTTP/HTTPS ports configured');
    } else {
        issues.push('❌ HTTP/HTTPS ports not configured');
        validationPassed = false;
    }
    
    if (dockerConfig.includes('expose:\n      - "3003"')) {
        passed.push('✅ App internal port exposure configured');
    } else {
        issues.push('❌ App port exposure not configured');
        validationPassed = false;
    }
    
} catch (error) {
    issues.push('❌ Cannot read Docker Compose Nginx configuration');
    validationPassed = false;
}

// 4. Check if SSL directory exists or needs creation
console.log('🔐 Checking SSL setup...');
if (fs.existsSync('nginx/ssl')) {
    if (fs.existsSync('nginx/ssl/flexjobs.crt') && fs.existsSync('nginx/ssl/flexjobs.key')) {
        passed.push('✅ SSL certificates exist');
    } else {
        issues.push('⚠️  SSL certificates need to be generated');
    }
} else {
    issues.push('⚠️  SSL directory needs to be created');
}

// Display results
console.log('\n📋 Nginx Setup Validation Results:\n');

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

// Summary and instructions
if (validationPassed) {
    console.log('🎯 Nginx Configuration: READY');
} else {
    console.log('❌ Nginx Configuration: NEEDS SETUP');
}

console.log('\n🚀 NGINX SETUP INSTRUCTIONS:\n');

console.log('1. 🔐 Generate SSL Certificates:');
console.log('   Windows: .\\generate-ssl-certs.ps1');
console.log('   Linux/Mac: ./generate-ssl-certs.sh\n');

console.log('2. 🌐 Update your hosts file:');
console.log('   Windows: C:\\Windows\\System32\\drivers\\etc\\hosts');
console.log('   Linux/Mac: /etc/hosts');
console.log('   Add these lines:');
console.log('   127.0.0.1 flexjobs.local');
console.log('   127.0.0.1 www.flexjobs.local');
console.log('   127.0.0.1 api.flexjobs.local\n');

console.log('3. 🐳 Start with Nginx:');
console.log('   docker-compose -f docker-compose.nginx.yml up -d\n');

console.log('4. 🔍 Verify setup:');
console.log('   http://flexjobs.local (should redirect to HTTPS)');
console.log('   https://flexjobs.local (main application)');
console.log('   https://api.flexjobs.local (API endpoint)\n');

console.log('📋 NGINX BENEFITS:\n');
console.log('✅ Performance:');
console.log('   • Static file serving');
console.log('   • Gzip compression');
console.log('   • HTTP/2 support');
console.log('   • Connection pooling\n');

console.log('✅ Security:');
console.log('   • SSL termination');
console.log('   • Security headers');
console.log('   • Request filtering');
console.log('   • Rate limiting capabilities\n');

console.log('✅ Scalability:');
console.log('   • Load balancing ready');
console.log('   • Upstream health checks');
console.log('   • Multiple app instances support');
console.log('   • Reverse proxy benefits\n');

console.log('🔧 CONFIGURATION FEATURES:\n');
console.log('• Automatic HTTP to HTTPS redirect');
console.log('• Static file optimization with long cache headers');
console.log('• API route proxying to Node.js application');
console.log('• Security headers for XSS/CSRF protection');
console.log('• Gzip compression for better performance');
console.log('• SSL/TLS with modern security settings');
console.log('• Health check endpoints');
console.log('• Error page handling');

process.exit(validationPassed ? 0 : 1);
