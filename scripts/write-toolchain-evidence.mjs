import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE = path.join(ROOT, ".website-manager");
const OUT = process.env.TOOLCHAIN_EVIDENCE_PATH
  ? path.resolve(process.env.TOOLCHAIN_EVIDENCE_PATH)
  : path.join(STATE, "toolchain-evidence.json");

function head() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .trim()
    .toLowerCase();
}

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const hasNodeModules = fs.existsSync(path.join(ROOT, "node_modules"));
const hasTscBin =
  fs.existsSync(path.join(ROOT, "node_modules/typescript/bin/tsc")) ||
  fs.existsSync(path.join(ROOT, "node_modules/.bin/tsc"));
const hasTsconfig = fs.existsSync(path.join(ROOT, "tsconfig.json"));

const checks = {
  npmTestScriptPresent: typeof pkg.scripts.test === "string" && pkg.scripts.test.length > 0,
  lintScriptIsEslint: pkg.scripts.lint === "eslint",
  typecheckScriptPresent:
    typeof pkg.scripts.typecheck === "string" && /tsc/.test(pkg.scripts.typecheck),
  typescriptDependencyPresent: Boolean(
    (pkg.devDependencies && pkg.devDependencies.typescript) ||
      (pkg.dependencies && pkg.dependencies.typescript),
  ),
  // Only require the binary when node_modules is installed in this checkout.
  tscBinaryPresentWhenInstalled: !hasNodeModules || hasTscBin,
  tsconfigPresent: hasTsconfig,
};

const failures = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

const evidence = {
  schema: 1,
  kind: "local-toolchain-evidence",
  recordedAt: new Date().toISOString(),
  head: head(),
  network: false,
  executedLint: false,
  executedTypecheck: false,
  executedBuild: false,
  policy: "package.json lint + typecheck + npm test scripts with local typescript",
  checks,
  failures,
  bans: [
    "Local toolchain policy evidence only — does not claim a live CI run",
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
