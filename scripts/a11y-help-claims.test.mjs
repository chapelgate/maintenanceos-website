#!/usr/bin/env node
/**
 * a11y-help-claims.test.mjs
 * Validates that no help article claims WCAG 2.2 AA compliance while publicLaunch=false
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Check publicLaunch flag is false (not claimed)
let isPublicLaunch = false;
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  isPublicLaunch = envContent.includes('NEXT_PUBLIC_PUBLIC_LAUNCH=true');
}
console.log(`publicLaunch flag: ${isPublicLaunch ? 'TRUE' : 'FALSE'}`);

// Read all help articles
const helpDir = join(process.cwd(), 'src', 'content', 'help');
const helpFiles = readdirSync(helpDir).filter(f => f.endsWith('.mdx'));

console.log(`Found ${helpFiles.length} help articles`);

// WCAG AA claim patterns to look for
const wcagaaPatterns = [
  /WCAG\s*2\.?2\s*AA/i,
  /WCAG\s*22\s*AA/i,
  /WCAG\s*2\.?2\s*Level\s*AA/i,
  /AA\s*conformance/i,
  /AA\s*certified/i,
  /WCAG\s*2\.?2\s*certification/i,
  /WCAG\s*2\.?2\s*compliance/i,
];

let violations = [];

for (const file of helpFiles) {
  const filePath = join(helpDir, file);
  const content = readFileSync(filePath, 'utf-8');

  for (const pattern of wcagaaPatterns) {
    const matches = content.match(pattern);
    if (matches && !isPublicLaunch) {
      violations.push({ file, pattern: pattern.source, matches });
    }
  }
}

if (violations.length > 0) {
  console.error('FAIL: Help articles claim WCAG AA while publicLaunch=false:');
  for (const v of violations) {
    console.error(`  - ${v.file}: matched /${v.pattern}/`);
  }
  process.exit(1);
}

console.log('PASS: No help articles make unsupported WCAG AA claims');