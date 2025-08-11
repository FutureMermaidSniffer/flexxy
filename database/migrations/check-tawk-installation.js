const fs = require('fs');
const path = require('path');

function checkTawkInstallation() {
  console.log('🔍 Diagnosing Tawk.to Widget Installation...\n');
  
  const frontendDir = path.join(__dirname, '../../frontend');
  const htmlFiles = ['index.html', 'jobs.html', 'blog.html', 'career-advice.html', 'events.html'];
  
  htmlFiles.forEach(fileName => {
    const filePath = path.join(frontendDir, fileName);
    
    if (fs.existsSync(filePath)) {
      console.log(`📄 Checking ${fileName}:`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if Tawk.to script exists
      if (content.includes('embed.tawk.to')) {
        console.log('   ✅ Tawk.to script found');
        
        // Check the widget ID
        const widgetIdMatch = content.match(/embed\.tawk\.to\/([^\/]+)/);
        if (widgetIdMatch) {
          console.log(`   🆔 Widget ID: ${widgetIdMatch[1]}`);
        }
        
        // Check if script is before closing body tag
        const bodyCloseIndex = content.lastIndexOf('</body>');
        const tawkIndex = content.indexOf('embed.tawk.to');
        
        if (bodyCloseIndex > -1 && tawkIndex > -1) {
          if (tawkIndex < bodyCloseIndex) {
            console.log('   ✅ Script positioned before </body> tag');
          } else {
            console.log('   ❌ Script positioned after </body> tag');
          }
        }
        
        // Check for duplicate scripts
        const tawkMatches = content.match(/embed\.tawk\.to/g);
        if (tawkMatches && tawkMatches.length > 1) {
          console.log(`   ⚠️  Multiple Tawk.to scripts found (${tawkMatches.length})`);
        } else {
          console.log('   ✅ Single Tawk.to script (no duplicates)');
        }
        
      } else {
        console.log('   ❌ Tawk.to script NOT found');
      }
      
      console.log('');
    } else {
      console.log(`   ⚠️  File not found: ${fileName}`);
    }
  });
  
  console.log('💡 Troubleshooting Tips:');
  console.log('   1. Make sure you\'re testing on the actual deployed website, not local file://');
  console.log('   2. Check browser console for JavaScript errors');
  console.log('   3. Verify the Tawk.to widget ID is correct: 689982a66c9cf419227185ed');
  console.log('   4. Clear browser cache and refresh');
  console.log('   5. Check if ad blockers are blocking the widget');
  console.log('   6. Test in incognito/private browsing mode');
}

// Run the diagnostic
checkTawkInstallation();
