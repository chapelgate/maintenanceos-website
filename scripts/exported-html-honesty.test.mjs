import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function visible(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.html$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const outDir = path.join(ROOT, "out");
const htmlFiles = fs.existsSync(outDir) ? walk(outDir) : [];

// Exported static HTML must not leak any live-commercial claim (phone, uptime,
// SLA, GA) into public-facing output when out/ is built.
test("exported HTML keeps live-phone, uptime and SLA out of public pages", () => {
  if (htmlFiles.length === 0) {
    console.log("skip: out/ not built for this checkout");
    return;
  }
  const forbidden = [
    /live phone/i,
    /uptime (guarantee|percent|of [0-9])/i,
    /service level agreement/i,
    /commercial[ly ]* (general )?available/i,
    /generally available/i,
  ];
  for (const file of htmlFiles) {
    const text = visible(fs.readFileSync(file, "utf8"));
    for (const pattern of forbidden) {
      assert.doesNotMatch(
        text,
        pattern,
        `${path.relative(outDir, file)} matches ${pattern}`,
      );
    }
  }
});

// Exported HTML keeps pre-launch positioning (not "live" or "now available").
test("exported HTML keeps pre-launch positioning", () => {
  if (htmlFiles.length === 0) return;
  const preLaunch = /pre-launch|coming soon|request pricing|not yet/i;
  let seen = false;
  for (const file of htmlFiles) {
    const text = visible(fs.readFileSync(file, "utf8"));
    if (preLaunch.test(text)) seen = true;
  }
  assert.ok(seen, "no pre-launch positioning found in exported HTML");
});
