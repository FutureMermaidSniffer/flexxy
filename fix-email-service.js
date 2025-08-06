const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixEmailService() {
    console.log('🚀 Fixing email service implementation...');
    
    const emailServicePath = path.join(process.cwd(), 'backend', 'services', 'email.js');
    
    try {
        // Read the current file
        let fileContent = fs.readFileSync(emailServicePath, 'utf8');
        
        // Replace createTransporter with createTransport
        const fixedContent = fileContent.replace(/createTransporter/g, 'createTransport');
        
        // Write the fixed content back
        fs.writeFileSync(emailServicePath, fixedContent);
        
        console.log('✅ Fixed email.js service: replaced createTransporter with createTransport');
        console.log('🎉 Email service fix completed successfully!');
    } catch (error) {
        console.error(`❌ Error fixing email service: ${error.message}`);
        
        if (error.code === 'ENOENT') {
            console.error(`File not found: ${emailServicePath}`);
            console.error('Make sure you run this script from the project root directory');
        }
    }
}

// Run the fix if this file is executed directly
if (require.main === module) {
    fixEmailService()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fix failed:', error);
            process.exit(1);
        });
}

module.exports = { fixEmailService };
