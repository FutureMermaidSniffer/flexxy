#!/usr/bin/env node
/**
 * Extract data-i18n* markers from frontend HTML into source.en.json
 * Usage: node scripts/extract-translations.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const frontend = path.join(root, 'frontend');
const outFile = path.join(frontend, 'locales', 'source.en.json');

const ATTRS = [
  'data-i18n',
  'data-i18n-placeholder',
  'data-i18n-alt',
  'data-i18n-title',
  'data-i18n-aria-label',
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function extractFromHtml(content, filePath, bag) {
  for (const attr of ATTRS) {
    // Match attr="key" and capture element snippet for value heuristics
    const re = new RegExp(
      `<([a-zA-Z0-9]+)([^>]*?)\\s${attr}="([^"]+)"([^>]*)>([\\s\\S]*?)<\\/\\1>`,
      'gi'
    );
    let m;
    while ((m = re.exec(content)) !== null) {
      const tag = m[1].toLowerCase();
      const key = m[3];
      let text = m[5].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      // Self-closing / void with value from attrs
      if (!text) {
        const openAttrs = m[2] + m[4];
        if (attr === 'data-i18n-placeholder' || attr === 'data-i18n') {
          const ph = openAttrs.match(/placeholder="([^"]*)"/i);
          if (ph) text = ph[1];
        }
        if (attr === 'data-i18n-alt' || attr === 'data-i18n') {
          const al = openAttrs.match(/alt="([^"]*)"/i);
          if (al) text = al[1];
        }
        if (attr === 'data-i18n-title') {
          const ti = openAttrs.match(/title="([^"]*)"/i);
          if (ti) text = ti[1];
        }
        if (attr === 'data-i18n-aria-label') {
          const ar = openAttrs.match(/aria-label="([^"]*)"/i);
          if (ar) text = ar[1];
        }
        if (tag === 'input') {
          const val = openAttrs.match(/value="([^"]*)"/i);
          if (val && !text) text = val[1];
        }
      }

      if (key && text && !bag[key]) {
        bag[key] = text;
      } else if (key && text && bag[key] !== text) {
        // Keep first; log conflicts lightly
      }
    }

    // Void / input without closing tag
    const voidRe = new RegExp(
      `<([a-zA-Z0-9]+)([^>]*?)\\s${attr}="([^"]+)"([^>]*)\\/?>`,
      'gi'
    );
    while ((m = voidRe.exec(content)) !== null) {
      const tag = m[1].toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'label', 'li', 'option', 'div', 'small', 'title'].includes(tag)) {
        continue; // handled by closed-tag regex
      }
      const key = m[3];
      const openAttrs = m[2] + m[4];
      let text = '';
      const ph = openAttrs.match(/placeholder="([^"]*)"/i);
      if (ph) text = ph[1];
      const al = openAttrs.match(/alt="([^"]*)"/i);
      if (al && !text) text = al[1];
      const ti = openAttrs.match(/(?:^|\s)title="([^"]*)"/i);
      if (ti && !text) text = ti[1];
      const ar = openAttrs.match(/aria-label="([^"]*)"/i);
      if (ar && !text) text = ar[1];
      const val = openAttrs.match(/value="([^"]*)"/i);
      if (val && !text) text = val[1];
      if (key && text && !bag[key]) bag[key] = text;
    }
  }
}

function main() {
  const existing = fs.existsSync(outFile)
    ? JSON.parse(fs.readFileSync(outFile, 'utf8'))
    : {};

  const bag = { ...existing };
  const files = walk(frontend);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    extractFromHtml(content, file, bag);
  }

  // Sort keys for stable diffs
  const sorted = {};
  Object.keys(bag)
    .sort()
    .forEach((k) => {
      sorted[k] = bag[k];
    });

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  console.log(`✅ Wrote ${Object.keys(sorted).length} keys → ${path.relative(root, outFile)}`);
  console.log(`   Scanned ${files.length} HTML files`);
}

main();
