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

test("deployment verifier mismatch exits cleanly after fetch", async () => {
  const { createServer } = await import("node:http");
  const { spawn } = await import("node:child_process");
  const liveCommit = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const expectedCommit = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

  const server = createServer((request, response) => {
    if (request.url?.startsWith("/release.json")) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({
        schema: 1,
        commit: liveCommit,
        builtAt: "2026-09-26T00:00:00.000Z",
      }));
      return;
    }
    response.writeHead(404);
    response.end();
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");

  try {
    const child = spawn(process.execPath, ["scripts/deployment-verifier.mjs"], {
      env: {
        ...process.env,
        WEBSITE_SITE_URL: `http://127.0.0.1:${address.port}`,
        EXPECTED_COMMIT: expectedCommit,
        SKIP_HEALTH_MONITOR: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });

    const code = await new Promise((resolve) => child.once("close", resolve));
    assert.equal(code, 1);
    assert.match(stdout, /live commit .* != expected/);
    assert.doesNotMatch(stderr, /Assertion failed|UV_HANDLE_CLOSING/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
