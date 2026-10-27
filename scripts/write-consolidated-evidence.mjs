import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE = path.join(ROOT, ".website-manager");
const OUT = process.env.CONSOLIDATED_EVIDENCE_PATH
  ? path.resolve(process.env.CONSOLIDATED_EVIDENCE_PATH)
  : path.join(STATE, "consolidated-evidence.json");

function head() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .trim()
    .toLowerCase();
}

function runWriter(rel, envKey, tmpName) {
  const tmp = path.join(os.tmpdir(), `${tmpName}-${process.pid}.json`);
  const result = execFileSync(process.execPath, [path.join(ROOT, rel)], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, [envKey]: tmp },
  });
  const evidence = JSON.parse(fs.readFileSync(tmp, "utf8"));
  try { fs.unlinkSync(tmp); } catch {}
  return { stdoutOk: Boolean(result), evidence };
}

const headSha = head();
const parts = {
  candidate: runWriter(
    "scripts/write-candidate-evidence.mjs",
    "CANDIDATE_EVIDENCE_PATH",
    "mw-cand",
  ).evidence,
  secretScan: runWriter(
    "scripts/write-secret-scan-evidence.mjs",
    "SECRET_SCAN_EVIDENCE_PATH",
    "mw-sec",
  ).evidence,
  rollback: runWriter(
    "scripts/write-rollback-evidence.mjs",
    "ROLLBACK_EVIDENCE_PATH",
    "mw-rb",
  ).evidence,
  health: runWriter(
    "scripts/write-health-artifact.mjs",
    "HEALTH_ARTIFACT_PATH",
    "mw-hlth",
  ).evidence,
};

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const releaseWriter = fs.readFileSync(
  path.join(ROOT, "scripts/write-release-marker.mjs"),
  "utf8",
);

const checks = {
  candidateOk: parts.candidate.ok === true && parts.candidate.head === headSha,
  secretScanOk: parts.secretScan.ok === true && parts.secretScan.head === headSha,
  rollbackOk: parts.rollback.ok === true && parts.rollback.head === headSha,
  healthOk: parts.health.head === headSha && parts.health.network === false,
  releaseMarkerDeniesLaunch:
    /public_launch:\s*false/.test(releaseWriter) &&
    /commercial_ga:\s*false/.test(releaseWriter) &&
    /live_phone:\s*false/.test(releaseWriter),
  npmScriptsPresent:
    pkg.scripts["candidate:evidence"] ===
      "node scripts/write-candidate-evidence.mjs" &&
    pkg.scripts["secret-scan:evidence"] ===
      "node scripts/write-secret-scan-evidence.mjs" &&
    pkg.scripts["rollback:evidence"] ===
      "node scripts/write-rollback-evidence.mjs" &&
    pkg.scripts["health:artifact"] === "node scripts/write-health-artifact.mjs" &&
    pkg.scripts["consolidated:evidence"] ===
      "node scripts/write-consolidated-evidence.mjs",
};

const failures = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

const evidence = {
  schema: 1,
  kind: "local-consolidated-evidence",
  recordedAt: new Date().toISOString(),
  head: headSha,
  network: false,
  parts: {
    candidate: { ok: parts.candidate.ok, head: parts.candidate.head },
    secretScan: { ok: parts.secretScan.ok, head: parts.secretScan.head },
    rollback: { ok: parts.rollback.ok, head: parts.rollback.head },
    health: {
      network: parts.health.network,
      head: parts.health.head,
      mode: parts.health.mode,
    },
  },
  checks,
  failures,
  bans: [
    "Local consolidated evidence only — no live deploy or production host SHA",
    "Does not deploy or alter nginx",
    "Does not set NEXT_PUBLIC_PUBLIC_LAUNCH=true",
    "Does not call the golden phone line",
  ],
  ok: failures.length === 0,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(evidence, null, 2) + "\n", "utf8");
console.log(JSON.stringify(evidence, null, 2));
if (!evidence.ok) process.exitCode = 1;
