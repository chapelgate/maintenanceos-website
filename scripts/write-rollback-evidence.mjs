import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE = path.join(ROOT, ".website-manager");
const OUT = process.env.ROLLBACK_EVIDENCE_PATH
  ? path.resolve(process.env.ROLLBACK_EVIDENCE_PATH)
  : path.join(STATE, "rollback-evidence.json");

function head() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .trim()
    .toLowerCase();
}

const rollback = fs.readFileSync(path.join(ROOT, "scripts/rollback-plan.mjs"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

const checks = {
  rollbackPlanScriptPresent: fs.existsSync(path.join(ROOT, "scripts/rollback-plan.mjs")),
  packageExposesRollbackPlan: pkg.scripts["rollback:plan"] === "node scripts/rollback-plan.mjs",
  revertOnly: /git revert --no-edit/.test(rollback),
  forbidsHardResetOnSharedMain:
    /git reset --hard on shared main/.test(rollback) &&
    !/execFileSync\("git", \["reset", "--hard"/.test(rollback),
  forbidsForcePushMain: /force-push main/.test(rollback),
  forbidsVoicePathRepair: /frozen live voice|MaintenanceOS voice/.test(rollback),
};

const failures = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

const evidence = {
  schema: 1,
  kind: "local-rollback-evidence",
  recordedAt: new Date().toISOString(),
  head: head(),
  strategy: "git-revert-preserve-history",
  network: false,
  executed: false,
  checks,
  failures,
  bans: [
    "Local evidence only — does not run git revert",
    "Does not force-push main",
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
