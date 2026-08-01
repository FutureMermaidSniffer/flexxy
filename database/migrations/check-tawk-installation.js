/**
 * DEPRECATED: Tawk.to removed. Checks that embeds are gone.
 */
const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../../frontend');
const files = fs.readdirSync(frontendDir).filter((f) => f.endsWith('.html'));
let found = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(frontendDir, file), 'utf8');
  if (content.includes('embed.tawk.to') || content.includes('Tawk_API')) {
    console.log(`❌ Still present: ${file}`);
    found++;
  }
}

if (found === 0) {
  console.log(`✅ Tawk.to removed from all ${files.length} frontend HTML pages.`);
} else {
  console.log(`Found ${found} page(s) still containing Tawk.to`);
  process.exitCode = 1;
}
