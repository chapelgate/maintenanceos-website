import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const STATE = path.join(ROOT, ".website-manager");
const SHA_RE = /^[0-9a-f]{7,40}$/i;
const command = process.argv[2]?.trim();

fs.mkdirSync(STATE, { recursive: true });

function now() {
  return new Date().toISOString();
}

function head() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim().toLowerCase();
}

function branch() {
  return execFileSync("git", ["branch", "--show-current"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
}

function writeJson(name, value) {
  const file = path.join(STATE, name);
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
  return file;
}

function readJson(name) {
  const file = path.join(STATE, name);
  if (!fs.existsSync(file)) {
    throw new Error(`missing Website Manager state: ${name}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function runNode(script) {
  return spawnSync(process.execPath, [script], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
}

function runNpm(args) {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) {
    throw new Error("Website Manager commands must be invoked through npm run");
  }
  return spawnSync(process.execPath, [npmCli, ...args], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
}

function exitFrom(result) {
  process.exit(result.status ?? 1);
}

function monitor() {
  const health = runNode("scripts/website-health-monitor.mjs");
  const seo = runNode("scripts/seo-live-monitor.mjs");
  const healthy = health.status === 0 && seo.status === 0;
  const record = {
    schema: 1,
    phase: "monitor-detect",
    checkedAt: now(),
    branch: branch(),
    head: head(),
    healthExit: health.status,
    seoExit: seo.status,
    status: healthy ? "healthy" : "repair_required",
    repairPolicy: healthy
      ? "not_required"
      : "inspect the failing gate, make the smallest evidence-backed repair, then rerun manager:monitor",
  };
  writeJson("monitor.json", record);
  console.log(JSON.stringify(record, null, 2));
  if (!healthy) process.exit(1);
}

function preflight() {
  const detection = readJson("monitor.json");
  if (detection.status !== "healthy") {
    throw new Error("monitor/detect is not healthy; repair and rerun manager:monitor first");
  }
  const result = runNpm(["run", "release:preflight"]);
  const record = {
    schema: 1,
    phase: "repair-test",
    checkedAt: now(),
    branch: branch(),
    head: head(),
    monitorStatus: detection.status,
    repairStatus:
      process.env.WEBSITE_MANAGER_REPAIR_NOTE?.trim() ||
      "not_required_current_monitor_healthy",
    preflightExit: result.status,
    status: result.status === 0 ? "passed" : "failed",
  };
  writeJson("preflight.json", record);
  console.log(JSON.stringify(record, null, 2));
  if (result.status !== 0) exitFrom(result);
}

function verify() {
  const expected = process.env.EXPECTED_COMMIT?.trim().toLowerCase();
  if (!expected || !SHA_RE.test(expected)) {
    throw new Error("EXPECTED_COMMIT=<merge-sha> is required for manager:verify");
  }
  const result = runNpm(["run", "release:verify"]);
  const record = {
    schema: 1,
    phase: "deploy-verify",
    checkedAt: now(),
    branch: branch(),
    localHead: head(),
    expectedCommit: expected,
    verifyExit: result.status,
    status: result.status === 0 ? "verified" : "failed",
  };
  writeJson("verify.json", record);
  console.log(JSON.stringify(record, null, 2));
  if (result.status !== 0) exitFrom(result);
}

function recordEvidence() {
  const detection = readJson("monitor.json");
  const preflightRecord = readJson("preflight.json");
  const verification = readJson("verify.json");

  const failures = [];
  if (detection.status !== "healthy") failures.push("monitor not healthy");
  if (preflightRecord.status !== "passed") failures.push("preflight not passed");
  if (verification.status !== "verified") failures.push("deployment not verified");
  if (failures.length) {
    throw new Error("cannot record incomplete Website Manager loop: " + failures.join(", "));
  }

  const evidence = {
    schema: 1,
    phase: "record",
    recordedAt: now(),
    monitor: detection,
    preflight: preflightRecord,
    verification,
    durableRecord:
      process.env.WEBSITE_MANAGER_PR_NUMBER?.trim()
        ? `github-pr-comment:#${process.env.WEBSITE_MANAGER_PR_NUMBER.trim()}`
        : "local-only",
  };
  writeJson("latest-record.json", evidence);

  const lines = [
    "## Website Manager release evidence",
    "",
    `- Recorded: ${evidence.recordedAt}`,
    `- Monitor/detect: **${detection.status}**`,
    `- Repair: **${preflightRecord.repairStatus}**`,
    `- Test/preflight: **${preflightRecord.status}**`,
    `- Verified commit: \`${verification.expectedCommit}\``,
    `- Deploy/verify: **${verification.status}**`,
    "",
    "Controls reused: website health monitor, SEO monitor, release preflight, exact release marker, deployment verifier, performance budget, accessibility gate.",
    "",
    "No force-push, manual hosting mutation, duplicate deployment service, or voice/backend repair path was used.",
  ];
  const markdown = lines.join("\n") + "\n";
  const markdownFile = path.join(STATE, "latest-record.md");
  fs.writeFileSync(markdownFile, markdown, "utf8");

  const pr = process.env.WEBSITE_MANAGER_PR_NUMBER?.trim();
  if (pr) {
    if (!/^\d+$/.test(pr)) throw new Error("WEBSITE_MANAGER_PR_NUMBER must be numeric");
    const comment = spawnSync(
      "gh",
      ["pr", "comment", pr, "--body-file", markdownFile],
      { cwd: ROOT, stdio: "inherit", shell: false, env: process.env },
    );
    if (comment.status !== 0) exitFrom(comment);
  }

  console.log(JSON.stringify(evidence, null, 2));
}

try {
  if (command === "monitor") monitor();
  else if (command === "preflight") preflight();
  else if (command === "verify") verify();
  else if (command === "record") recordEvidence();
  else {
    console.error(
      "Usage: npm run manager:monitor | manager:preflight | manager:verify | manager:record",
    );
    process.exit(2);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
