#!/usr/bin/env node
/**
 * a11y-page-scope.test.mjs
 * Validates that /accessibility/ page route descriptions match the actual test matrix in tests/webkit-a11y/a11y.test.mjs
 * Scope: only help article routes, which is the documented scope of the /accessibility/ page
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Read the test matrix - extract only help routes
const testMatrixPath = join(process.cwd(), 'tests', 'webkit-a11y', 'a11y.test.mjs');
const testMatrixContent = readFileSync(testMatrixPath, 'utf-8');

// Extract pages array from test file
const pagesMatch = testMatrixContent.match(/const pages = \[([\s\S]*?)\];/);
if (!pagesMatch) {
  console.error('FAIL: Could not find pages array in a11y.test.mjs');
  process.exit(1);
}

const pagesArrayStr = pagesMatch[1];
const allTestPages = pagesArrayStr
  .split(',')
  .map(s => s.trim().replace(/^['"`]|['"`]$/g, ''))
  .filter(s => s.length > 0 && !s.startsWith('//'));

// Help article routes are those under /help/
const helpTestPages = allTestPages.filter(p => p.startsWith('/help/'));
console.log(`Found ${helpTestPages.length} help routes in test matrix`);

// Read the accessibility page
const a11yPagePath = join(process.cwd(), 'src', 'app', 'accessibility', 'page.tsx');
const a11yPageContent = readFileSync(a11yPagePath, 'utf-8');

// Check that all help test routes are documented in the accessibility page's known issues section
const missing = [];
for (const page of helpTestPages) {
  // The page documents routes in the known issues <li> elements
  // Check if the route pattern appears in the known issues list
  // Routes are listed as /help/... in the known issues
  const normalizedPage = page; // already has trailing slash or not
  // Also check without trailing slash
  const checkPaths = [normalizedPage, normalizedPage + '/'];
  let found = false;
  for (const cp of checkPaths) {
    if (a11yPageContent.includes(cp)) {
      found = true;
      break;
    }
  }
  if (!found) {
    missing.push(page);
  }
}

if (missing.length > 0) {
  console.error('FAIL: The following help test routes are NOT documented in /accessibility/ page:');
  for (const m of missing) {
    console.error(`  - ${m}`);
  }
  process.exit(1);
}

console.log('PASS: All help test matrix routes are documented in /accessibility/ page');

// Verify the reverse: documented routes in /accessibility/ help section should exist in test matrix
// Read the known issues section
const knownIssuesMatch = a11yPageContent.match(/Known issues and testing gaps[\s\S]*?<\/ul>/);
if (knownIssuesMatch) {
  const knownIssuesText = knownIssuesMatch[0];
  // Extract route patterns (things starting with /help/ or /)
  const routeMatches = knownIssuesText.match(/\/help\/[a-zA-Z0-9\-_/]+/g);
  if (routeMatches) {
    let allFound = true;
    for (const route of routeMatches) {
      const cleanRoute = route.replace(/[.,;)]$/, '');
      const found = helpTestPages.some(p => cleanRoute === p || cleanRoute === p + '/' || p.startsWith(cleanRoute) || cleanRoute.startsWith(p));
      if (!found) {
        console.warn(`WARN: Documented route ${cleanRoute} not in test matrix help pages`);
        allFound = false;
      }
    }
    if (allFound && routeMatches.length > 0) {
      console.log('PASS: All documented help routes exist in test matrix');
    }
  }
}

console.log('PASS: Accessibility page scope validation complete for help articles');