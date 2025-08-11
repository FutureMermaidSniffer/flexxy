const fs = require('fs');
const path = require('path');

// The exact Tawk.to script as provided
const tawkScript = `<!--Start of Tawk.to Script-->
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

// Function to remove existing Tawk.to installations
function removeTawkFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let removed = false;
    
    // Remove any existing Tawk.to script blocks (various patterns)
    const tawkPatterns = [
      /<!--Start of Tawk\.to Script-->[\s\S]*?<!--End of Tawk\.to Script-->/g,
      /<script[^>]*>[\s\S]*?embed\.tawk\.to[\s\S]*?<\/script>/g,
      /<script[^>]*embed\.tawk\.to[^>]*>[\s\S]*?<\/script>/g,
      /var Tawk_API[\s\S]*?embed\.tawk\.to[\s\S]*?}\)\(\);/g
    ];
    
    tawkPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        removed = true;
      }
    });
    
    if (removed) {
      // Clean up any extra whitespace left behind
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`🧹 Removed existing Tawk.to from ${filePath}`);
    }
    
    return content;
  } catch (error) {
    console.error(`❌ Error removing Tawk.to from ${filePath}:`, error.message);
    return null;
  }
}

// Function to add Tawk.to script to a single HTML file
function addTawkToFile(filePath) {
  try {
    // First remove any existing Tawk.to installations
    let content = removeTawkFromFile(filePath);
    if (content === null) {
      return false;
    }
    
    // Find the closing </body> tag and insert script before it
    if (content.includes('</body>')) {
      content = content.replace('</body>', tawkScript + '\n</body>');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Added clean Tawk.to to ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No </body> tag found in ${filePath} - skipping`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to find all HTML files and add Tawk.to
function addTawkToAllPages() {
  const frontendDir = path.join(__dirname, '../../frontend');
  
  console.log('🚀 Cleaning and adding Tawk.to widget to all HTML pages...');
  console.log('🧹 Step 1: Removing any existing Tawk.to installations...');
  console.log('✨ Step 2: Adding clean Tawk.to widget...');
  console.log(`📁 Scanning directory: ${frontendDir}`);
  
  let processedCount = 0;
  let addedCount = 0;
  
  // List of HTML files to process
  const htmlFiles = [
    'index.html',
    'jobs.html',
    'blog.html',
    'career-advice.html',
    'events.html',
    'about.html',
    'contact.html',
    'login.html',
    'register.html',
    'admin-dashboard.html',
    'user-dashboard.html',
    'job-details.html',
    'pricing.html',
    'faq.html',
    'terms.html',
    'privacy.html'
  ];
  
  htmlFiles.forEach(fileName => {
    const filePath = path.join(frontendDir, fileName);
    
    if (fs.existsSync(filePath)) {
      processedCount++;
      if (addTawkToFile(filePath)) {
        addedCount++;
      }
    } else {
      console.log(`⚠️  File not found: ${fileName}`);
    }
  });
  
  console.log('\n🎉 Tawk.to Clean Installation Complete!');
  console.log(`📊 Summary:`);
  console.log(`   • ${processedCount} HTML files processed`);
  console.log(`   • ${addedCount} files updated with clean Tawk.to`);
  console.log(`   • All existing Tawk.to installations were removed first`);
  console.log('\n💬 The chat widget should now load properly on all pages!');
}

// Run the script
if (require.main === module) {
  addTawkToAllPages();
}

module.exports = { addTawkToAllPages, addTawkToFile };
