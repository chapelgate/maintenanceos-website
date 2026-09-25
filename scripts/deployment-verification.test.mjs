import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("build publishes an ignored source-commit release marker", () => {
  const pkg = JSON.parse(read("package.json"));
  const gitignore = read(".gitignore");
  const writer = read("scripts/write-release-marker.mjs");
  assert.match(pkg.scripts.build, /write-release-marker\.mjs/);
  assert.match(gitignore, /\/public\/release\.json/);
  assert.match(writer, /SOURCE_COMMIT_HASH/);
  assert.match(writer, /git", \["rev-parse", "HEAD"\]/);
  assert.match(writer, /throw new Error/);
});

test("deployment verifier checks exact commit and reuses health monitor", () => {
  const pkg = JSON.parse(read("package.json"));
  const verifier = read("scripts/deployment-verifier.mjs");
  assert.equal(
    pkg.scripts["deployment:verify"],
    "node scripts/deployment-verifier.mjs",
  );
  assert.equal(
    pkg.scripts["uptime:check"],
    "node scripts/website-health-monitor.mjs",
  );
  assert.match(verifier, /EXPECTED_COMMIT/);
  assert.match(verifier, /release\.json\?release_check=/);
  assert.match(verifier, /live commit/);
  assert.match(verifier, /website-health-monitor\.mjs/);
  assert.match(verifier, /cache-control/);
});
