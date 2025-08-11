const fs = require('fs');
const path = require('path');

// Tawk.to script to add
const tawkScript = `
    <!--Start of Tawk.to Script-->
    <script type="text/javascript">
    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    (function(){
    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async=true;
    s1.src='https://embed.tawk.to/689982a66c9cf419227185ed/1j2bqcnbl';
    s1.charset='UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1,s0);
    })();
    </script>
    <!--End of Tawk.to Script-->`;

// Function to find all HTML files
function findHtmlFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...findHtmlFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Function to add Tawk.to script to an HTML file
function addTawkToScript(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if Tawk.to script already exists
        if (content.includes('tawk.to') || content.includes('Tawk_API')) {
            console.log(`⚠️  Skipped ${filePath} - Tawk.to already present`);
            return false;
        }
        
        // Find the closing </body> tag
        const bodyCloseIndex = content.lastIndexOf('</body>');
        if (bodyCloseIndex === -1) {
            console.log(`⚠️  Skipped ${filePath} - No </body> tag found`);
            return false;
        }
        
        // Insert Tawk.to script before </body>
        const beforeBody = content.substring(0, bodyCloseIndex);
        const afterBody = content.substring(bodyCloseIndex);
        
        const newContent = beforeBody + tawkScript + '\n' + afterBody;
        
        // Write the updated content back to file
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Added Tawk.to to ${filePath}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main function
function addTawkToAllPages() {
    const frontendDir = path.join(__dirname, '..');
    console.log(`🔍 Searching for HTML files in: ${frontendDir}`);
    
    const htmlFiles = findHtmlFiles(frontendDir);
    console.log(`📁 Found ${htmlFiles.length} HTML files`);
    
    let successCount = 0;
    let skippedCount = 0;
    
    for (const file of htmlFiles) {
        const relativePath = path.relative(frontendDir, file);
        console.log(`\n📄 Processing: ${relativePath}`);
        
        const result = addTawkToScript(file);
        if (result) {
            successCount++;
        } else {
            skippedCount++;
        }
    }
    
    console.log(`\n🎉 Tawk.to Installation Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   • ${successCount} files updated with Tawk.to`);
    console.log(`   • ${skippedCount} files skipped`);
    console.log(`   • ${htmlFiles.length} total HTML files processed`);
    
    console.log(`\n💬 The Tawk.to chat widget is now available on all pages!`);
}

// Run the script
if (require.main === module) {
    addTawkToAllPages();
}

module.exports = { addTawkToAllPages };
