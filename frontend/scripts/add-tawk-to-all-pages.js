/**
 * DEPRECATED: Tawk.to has been removed from the site.
 * Live chat is handled by the first-party chat widget (/js/chat-widget.js).
 *
 * This script no longer injects Tawk embeds. Running it only reports status.
 */
const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..');
const files = fs.readdirSync(frontendDir).filter((f) => f.endsWith('.html'));

let stillPresent = 0;
for (const file of files) {
  const content = fs.readFileSync(path.join(frontendDir, file), 'utf8');
  if (content.includes('tawk.to') || content.includes('Tawk_API')) {
    stillPresent++;
    console.log(`⚠️  Tawk reference still in: ${file}`);
  }
}

if (stillPresent === 0) {
  console.log('✅ No Tawk.to embeds found in frontend HTML pages.');
  console.log('   First-party chat: /js/chat-widget.js');
} else {
  console.log(`Found ${stillPresent} file(s) still mentioning Tawk.to.`);
  process.exitCode = 1;
}
