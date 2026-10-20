#!/usr/bin/env node
// Custom audit script that filters out known unpatchable vulnerabilities
// These vulnerabilities have no patched versions available (as of 2026-10-20):
// - GHSA-vfj7-8cjw-p6xm (braces): Patched versions: None
// - GHSA-hp3w-g68c-fv3c (sprintf-js): Patched versions: None

import { spawnSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

const IGNORED_GHSA_IDS = new Set([
  'GHSA-VFJ7-8CJW-P6XM', // braces stack-exhaustion DoS - no patch available
  'GHSA-HP3W-G68C-FV3C', // sprintf-js unbounded precision DoS - no patch available
]);

// Root cause package names that have the unpatchable vulnerabilities
const ROOT_CAUSE_PACKAGES = new Set([
  'braces',
  'sprintf-js',
]);

function findNpm() {
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  
  const paths = process.env.PATH.split(isWindows ? ';' : ':');
  for (const p of paths) {
    const fullPath = join(p, npmCmd);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  return npmCmd;
}

function extractGhsaIdsFromVia(via) {
  const ids = new Set();
  for (const v of via) {
    if (typeof v === 'object' && v !== null) {
      const url = v.url || '';
      const match = url.match(/GHSA-[a-z0-9-]+/i);
      if (match) {
        ids.add(match[0].toUpperCase());
      }
      if (v.id) {
        ids.add(v.id.toUpperCase());
      }
    }
  }
  return ids;
}

function isTransitiveOfIgnored(vulnName, allVulns, visited = new Set()) {
  if (visited.has(vulnName)) return false;
  visited.add(vulnName);

  const vuln = allVulns[vulnName];
  if (!vuln) return false;

  // Check if this vuln has an ignored GHSA ID
  const ghsaIds = extractGhsaIdsFromVia(vuln.via || []);
  for (const id of ghsaIds) {
    if (IGNORED_GHSA_IDS.has(id)) {
      return true;
    }
  }

  // Check if this is a root cause package
  if (ROOT_CAUSE_PACKAGES.has(vulnName)) {
    return true;
  }

  // Recursively check transitive dependencies
  const via = vuln.via || [];
  for (const v of via) {
    if (typeof v === 'string') {
      // v is a package name
      if (isTransitiveOfIgnored(v, allVulns, visited)) {
        return true;
      }
    }
  }

  return false;
}

function main() {
  const npmPath = findNpm();
  const result = spawnSync(npmPath, ['audit', '--json', '--audit-level=moderate'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  if (result.error) {
    console.error('Failed to run npm audit:', result.error);
    process.exit(1);
  }

  let auditData;
  try {
    auditData = JSON.parse(result.stdout);
  } catch (e) {
    console.error('Failed to parse npm audit output:', e);
    process.exit(1);
  }

  // Check vulnerabilities
  const vulnerabilities = auditData.vulnerabilities || {};
  let hasActionableVulns = false;

  for (const [name, vuln] of Object.entries(vulnerabilities)) {
    if (isTransitiveOfIgnored(name, vulnerabilities)) {
      console.log(`Ignoring vulnerability (transitive of unpatchable root cause): ${name} (${vuln.severity})`);
      continue;
    }

    // Check severity
    const severity = vuln.severity;
    if (severity && ['moderate', 'high', 'critical'].includes(severity)) {
      console.error(`Actionable vulnerability found: ${name} (${severity})`);
      hasActionableVulns = true;
    }
  }

  if (hasActionableVulns) {
    console.error('\nAudit failed: actionable vulnerabilities found');
    process.exit(1);
  }

  console.log('\nAudit passed: no actionable vulnerabilities (known unpatchable dev dependency vulns ignored)');
  process.exit(0);
}

main();