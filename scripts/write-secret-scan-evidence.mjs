import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE = path.join(ROOT, ".website-manager");
const OUT = process.env.SECRET_SCAN_EVIDENCE_PATH
  ? path.resolve(process.env.SECRET_SCAN_EVIDENCE_PATH)
  : path.join(STATE, "secret-scan-evidence.json");

function head() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .trim()
    .toLowerCase();
}

const scan = fs.readFileSync(
  path.join(ROOT, "scripts/secret-pattern-scan.test.mjs"),
  "utf8",
);
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const gitignore = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");

const checks = {
  secretScanScriptPresent: fs.existsSync(
    path.join(ROOT, "scripts/secret-pattern-scan.test.mjs"),
  ),
  secretScanInNpmTest:
    /secret-pattern-scan\.test\.mjs/.test(pkg.scripts.test) ||
    /scripts\/\*\.test\.mjs/.test(pkg.scripts.test),
  secretScanSkipsBuildDirs:
    /SKIP_DIRS/.test(scan) &&
    /node_modules/.test(scan) &&
    /\.next/.test(scan) &&
    /\bout\b/.test(scan),
  forbidsGitleaksIgnoreHide:
    !fs.existsSync(path.join(ROOT, ".gitleaksignore")) &&
    !/\.gitleaksignore/.test(gitignore),
  scansCommonLiveSecretShapes:
    /AKIA/.test(scan) &&
    /PRIVATE KEY/.test(scan) &&
    /ghp_/.test(scan) &&
    /sk_live_/.test(scan),
};

const failures = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

const evidence = {
  schema: 1,
  kind: "local-secret-scan-evidence",
  recordedAt: new Date().toISOString(),
  head: head(),
  network: false,
  executedScan: false,
  policy: "scripts/secret-pattern-scan.test.mjs via npm test",
  checks,
  failures,
  bans: [
    "Local policy evidence only — does not mutate .gitleaksignore",
    "Does not deploy or alter nginx",
    "Does not set NEXT_PUBLIC_PUBLIC_LAUNCH=true",
    "Does not touch the MaintenanceOS golden phone line",
  ],
  ok: failures.length === 0,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(evidence, null, 2) + "\n", "utf8");
console.log(JSON.stringify(evidence, null, 2));
if (!evidence.ok) process.exitCode = 1;
