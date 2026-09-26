import { execFileSync, spawnSync } from "node:child_process";

const origin = (process.env.WEBSITE_SITE_URL ||
  "https://seahorse-app-4oasq.ondigitalocean.app").replace(/\/$/, "");
const SHA_RE = /^[0-9a-f]{7,40}$/i;

function expectedCommit() {
  const explicit = process.env.EXPECTED_COMMIT?.trim();
  if (explicit) {
    if (!SHA_RE.test(explicit)) throw new Error("EXPECTED_COMMIT is not a Git SHA");
    return explicit.toLowerCase();
  }
  const local = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  if (!SHA_RE.test(local)) throw new Error("Local HEAD is not a Git SHA");
  return local.toLowerCase();
}

async function main() {
  const expected = expectedCommit();
  const url = origin + "/release.json?release_check=" + Date.now();
  const response = await fetch(url, {
    headers: {
      "user-agent": "MaintenanceOS-Deployment-Verifier/1.0",
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
    cache: "no-store",
  });

  if (response.status !== 200) {
    console.error(JSON.stringify({
      ok: false,
      reason: "release_marker_http",
      status: response.status,
    }));
    return 1;
  }

  let marker;
  try {
    marker = await response.json();
  } catch {
    console.error(JSON.stringify({
      ok: false,
      reason: "release_marker_invalid_json",
    }));
    return 1;
  }

  const live = String(marker?.commit || "").toLowerCase();
  const failures = [];
  if (marker?.schema !== 1) failures.push("release marker schema mismatch");
  if (!SHA_RE.test(live)) failures.push("live release marker has no valid commit SHA");
  if (live !== expected) {
    failures.push(`live commit ${live || "missing"} != expected ${expected}`);
  }

  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    origin,
    expectedCommit: expected,
    liveCommit: live,
    builtAt: marker?.builtAt || null,
    failures,
    ok: failures.length === 0,
  }, null, 2));

  if (failures.length) return 1;

  if (process.env.SKIP_HEALTH_MONITOR !== "1") {
    const result = spawnSync(process.execPath, ["scripts/website-health-monitor.mjs"], {
      stdio: "inherit",
      env: process.env,
    });
    if (result.status !== 0) return result.status ?? 1;
  }

  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
