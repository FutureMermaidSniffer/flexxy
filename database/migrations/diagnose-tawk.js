const fs = require('fs');
const path = require('path');

function diagnoseTawkIssues() {
  console.log('🔍 Diagnosing Tawk.to Widget Issues...\n');
  
  const frontendDir = path.join(__dirname, '../../frontend');
  const indexPath = path.join(frontendDir, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log('❌ index.html not found!');
    return;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  
  // Check 1: Is Tawk.to script present?
  console.log('1. ✅ Checking if Tawk.to script is present...');
  if (content.includes('embed.tawk.to')) {
    console.log('   ✅ Tawk.to script found');
  } else {
    console.log('   ❌ Tawk.to script NOT found');
    return;
  }
  
  // Check 2: Is the widget ID correct?
  console.log('\n2. 🔍 Checking widget ID...');
  const widgetIdMatch = content.match(/embed\.tawk\.to\/([^\/]+)\/([^']+)/);
  if (widgetIdMatch) {
    console.log(`   ✅ Widget ID: ${widgetIdMatch[1]}`);
    console.log(`   ✅ Widget Key: ${widgetIdMatch[2]}`);
  } else {
    console.log('   ❌ Could not extract widget ID');
  }
  
  // Check 3: Script placement
  console.log('\n3. 📍 Checking script placement...');
  const bodyCloseIndex = content.lastIndexOf('</body>');
  const tawkIndex = content.indexOf('embed.tawk.to');
  
  if (bodyCloseIndex > -1 && tawkIndex > -1) {
    if (tawkIndex < bodyCloseIndex) {
      console.log('   ✅ Script is placed before </body> tag');
    } else {
      console.log('   ⚠️  Script is placed after </body> tag');
    }
  }
  
  // Check 4: Look for conflicts
  console.log('\n4. 🔍 Checking for potential conflicts...');
  const scriptTags = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  console.log(`   📊 Total script tags found: ${scriptTags.length}`);
  
  // Check for multiple Tawk.to instances
  const tawkInstances = content.match(/embed\.tawk\.to/g) || [];
  if (tawkInstances.length > 1) {
    console.log(`   ⚠️  Multiple Tawk.to instances found: ${tawkInstances.length}`);
  } else {
    console.log('   ✅ Single Tawk.to instance found');
  }
  
  // Check for common JavaScript errors
  const commonIssues = [
    { pattern: /var Tawk_API.*var Tawk_API/, message: 'Duplicate Tawk_API declarations' },
    { pattern: /Tawk_LoadStart.*Tawk_LoadStart/, message: 'Duplicate Tawk_LoadStart declarations' }
  ];
  
  commonIssues.forEach(issue => {
    if (issue.pattern.test(content)) {
      console.log(`   ⚠️  Potential issue: ${issue.message}`);
    }
  });
  
  // Check 5: Generate test recommendations
  console.log('\n5. 🧪 Troubleshooting Recommendations:');
  console.log('   • Open browser console (F12) and check for JavaScript errors');
  console.log('   • Verify the widget ID is correct in your Tawk.to dashboard');
  console.log('   • Check if the website domain is allowed in Tawk.to settings');
  console.log('   • Try the test file: /frontend/tawk-test.html');
  console.log('   • Clear browser cache and try again');
  console.log('   • Check if any ad blockers are blocking the widget');
  
  // Generate a clean version
  console.log('\n6. 🔧 Generating clean Tawk.to installation...');
  
  const cleanTawkScript = `<!--Start of Tawk.to Script-->
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

  console.log('   ✅ Clean script generated and ready');
  
  // Extract current script for comparison
  const tawkStart = content.indexOf('<!--Start of Tawk.to Script-->');
  const tawkEnd = content.indexOf('<!--End of Tawk.to Script-->') + '<!--End of Tawk.to Script-->'.length;
  
  if (tawkStart > -1 && tawkEnd > tawkStart) {
    const currentScript = content.substring(tawkStart, tawkEnd);
    console.log('\n📝 Current script:');
    console.log(currentScript);
    
    console.log('\n📝 Clean script should be:');
    console.log(cleanTawkScript);
    
    if (currentScript.trim() === cleanTawkScript.trim()) {
      console.log('\n✅ Scripts match exactly!');
    } else {
      console.log('\n⚠️  Scripts differ - this might be the issue');
    }
  }
}

// Run diagnostics
if (require.main === module) {
  diagnoseTawkIssues();
}

module.exports = { diagnoseTawkIssues };
