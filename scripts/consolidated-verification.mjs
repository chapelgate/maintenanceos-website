import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

function findNpm() {
  if (process.env.npm_execpath) return process.env.npm_execpath;
  const candidates = ["npm", "npx", "/usr/bin/npm", "/usr/local/bin/npm"];
  for (const c of candidates) {
    try {
      execFileSync(c, ["--version"], { stdio: "ignore" });
      return c;
    } catch {}
  }
  return "npm";
}

function run(cmd, args, label, opts = {}) {
  console.log(`[${label}] running...`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
    ...opts,
  });
  if (result.status !== 0) {
    console.error(`[${label}] FAILED (exit ${result.status})`);
    return { label, ok: false, error: `exit ${result.status}` };
  }
  console.log(`[${label}] PASS`);
  return { label, ok: true };
}

function headSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().toLowerCase();
  } catch {
    return "unknown";
  }
}

function shortSha(sha) {
  return sha.slice(0, 12);
}

async function main() {
  const sha = headSha();
  const npm = findNpm();
  console.log(`=== Consolidated Verification for ${sha} (${shortSha(sha)}) ===`);
  const results = [];

  results.push(run(npm, ["run", "build"], "build"));
  results.push(run(npm, ["test"], "full test suite"));
  results.push(run(npm, ["run", "lint"], "eslint"));
  results.push(run(process.execPath, ["--experimental-strip-types", "--check", "src/lib/static-security-headers.ts"], "typecheck (sample)"));
  results.push(run(process.execPath, ["scripts/live-security-audit.mjs"], "security:live (non-strict)"));
  results.push(run(npm, ["run", "performance:budget"], "performance:budget"));
  results.push(run(npm, ["run", "accessibility:check"], "accessibility:check"));
  results.push(run(npm, ["run", "functional:smoke"], "functional:smoke"));

  const markerPath = path.resolve("public/release.json");
  const fs = await import("node:fs");
  if (fs.existsSync(markerPath)) {
    const marker = JSON.parse(readFileSync(markerPath, "utf8"));
    if (String(marker.commit || "").toLowerCase() === sha) {
      console.log("[release-marker-sha] PASS (matches HEAD)");
      results.push({ label: "release-marker-sha", ok: true });
    } else {
      console.error(`[release-marker-sha] FAIL (marker ${marker.commit || "missing"} != HEAD ${sha})`);
      results.push({ label: "release-marker-sha", ok: false, error: "sha mismatch" });
    }
  } else {
    console.error("[release-marker-sha] FAIL (public/release.json missing)");
    results.push({ label: "release-marker-sha", ok: false, error: "missing marker" });
  }

  const allPass = results.every(r => r.ok);
  console.log(`=== SUMMARY ===`);
  console.log(`HEAD: ${sha}`);
  for (const r of results) {
    console.log(`  ${r.ok ? "✓" : "✗"} ${r.label}${r.error ? ` — ${r.error}` : ""}`);
  }
  console.log(`OVERALL: ${allPass ? "PASS" : "FAIL"}`);
  console.log(`PASS_COUNT: ${results.filter(r=>r.ok).length}/${results.length}`);
  if (!allPass) process.exitCode = 1;
}

main().catch(e => {
  console.error("Verification crashed:", e);
  process.exitCode = 1;
});
