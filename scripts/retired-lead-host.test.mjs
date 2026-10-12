import assert from "node:assert/strict";
import test from "node:test";

const ORIGIN = "https://rsfm-control-plane-production.up.railway.app";
const PATHS = ["/", "/health", "/v1/public/website-leads", "/v1/public/website-events"];

test("retired Railway control plane returns application-not-found", async () => {
  for (const path of PATHS) {
    const response = await fetch(ORIGIN + path, {
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.json();
    assert.equal(response.status, 404, path);
    assert.equal(body.message, "Application not found", path);
    assert.equal(body.code, 404, path);
  }
});
