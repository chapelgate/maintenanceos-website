#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");

// function read(rel) {
//   return fs.readFileSync(path.join(ROOT, rel), "utf8");
// }

function resourceHash(relFile) {
  const full = path.join(OUT, relFile.replace(/^\//, ""));
  if (!fs.existsSync(full)) return null;
  const bytes = fs.readFileSync(full);
  const digest = crypto.createHash("sha384").update(bytes).digest("base64");
  return `sha384-${digest}`;
}

export function verifySri(html) {
  const results = { covered: [], uncovered: [], total: 0 };

  // Match <script src="..." ...> and <link rel="stylesheet" href="..." ...>
  const scriptRegex = /<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const linkRegex = /<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi;

  for (const regex of [scriptRegex, linkRegex]) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[1];
      if (!url.startsWith("/_next/static/")) continue;

      const relPath = url;
      const tag = match[0];
      results.total += 1;

      const hash = resourceHash(relPath);
      if (!hash) {
        results.uncovered.push({ url, reason: "missing file in out/" });
        continue;
      }

      // Check if integrity attribute already present on this tag
      const integrityMatch = tag.match(/\bintegrity\s*=\s*["']([^"']+)["']/);
      if (integrityMatch) {
        const existing = integrityMatch[1];
        if (existing === hash) {
          results.covered.push({ url, hash, status: "verified" });
        } else {
          results.uncovered.push({ url, hash, existing, reason: "integrity mismatch" });
        }
      } else {
        results.uncovered.push({ url, hash, reason: "no integrity attribute" });
      }
    }
  }

  return results;
}

export function listOutResources() {
  if (!fs.existsSync(OUT)) return [];
  const resources = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".js") || entry.name.endsWith(".css")) {
        resources.push(path.relative(OUT, full));
      }
    }
  };
  walk(OUT);
  return resources.sort();
}

if (process.argv[1].endsWith("sri-verifier.mjs")) {
  const pages = [];
  const walkHtml = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkHtml(full);
      else if (entry.name === "index.html") pages.push(full);
    }
  };
  walkHtml(OUT);

  console.log(`SRI verification across ${pages.length} exported HTML pages`);
  let totalCovered = 0;
  let totalUncovered = 0;
  let totalResources = 0;

  for (const page of pages) {
    const html = fs.readFileSync(page, "utf8");
    const results = verifySri(html);
    totalCovered += results.covered.length;
    totalUncovered += results.uncovered.length;
    totalResources += results.total;
  }

  console.log(`Total resources: ${totalResources}`);
  console.log(`Covered by SRI: ${totalCovered}`);
  console.log(`Uncovered: ${totalUncovered}`);
}
