import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE = path.join(ROOT, ".website-manager");
const OUT = process.env.CANDIDATE_EVIDENCE_PATH
  ? path.resolve(process.env.CANDIDATE_EVIDENCE_PATH)
  : path.join(STATE, "candidate-evidence.json");

function head() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .trim()
    .toLowerCase();
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const pkg = JSON.parse(read("package.json"));
const secretScan = read("scripts/secret-pattern-scan.test.mjs");
const rollback = read("scripts/rollback-plan.mjs");
const monitor = read("scripts/website-health-monitor.mjs");
const site = read("src/config/site.ts");

const checks = {
  secretScanInNpmTest: /secret-pattern-scan\.test\.mjs/.test(pkg.scripts.test) || /scripts\/\*\.test\.mjs/.test(pkg.scripts.test),
  secretScanScriptPresent: exists("scripts/secret-pattern-scan.test.mjs"),
  secretScanSkipsBuildDirs: /SKIP_DIRS/.test(secretScan) && /node_modules/.test(secretScan),
  rollbackRevertOnly: /git revert --no-edit/.test(rollback) && !/execFileSync\("git", \["reset", "--hard"/.test(rollback),
  healthMonitorOptInControlPlane: /WEBSITE_CONTROL_PLANE/.test(monitor),
  healthMonitorNoRailwayDefault: !/railway\.app/.test(monitor),
  publicLaunchFailClosed: /publicLaunch[\s\S]*false/.test(site) || /PUBLIC_LAUNCH[\s\S]*!==\s*["']true["']/.test(site),
};

const failures = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

const evidence = {
  schema: 1,
  kind: "local-candidate-evidence",
  recordedAt: new Date().toISOString(),
  head: head(),
  branch: execFileSync("git", ["branch", "--show-current"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim(),
  checks,
  failures,
  ok: failures.length === 0,
  bans: [
    "Does not deploy",
    "Does not touch deploy/** or live nginx",
    "Does not set NEXT_PUBLIC_PUBLIC_LAUNCH=true",
    "Does not call the golden phone line",
    "Does not claim a production host SHA",
  ],
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(evidence, null, 2) + "\n", "utf8");
console.log(JSON.stringify(evidence, null, 2));
if (!evidence.ok) process.exitCode = 1;
