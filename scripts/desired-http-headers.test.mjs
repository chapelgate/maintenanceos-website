import assert from "node:assert/strict";
import { DESIRED_HTTP_HEADERS } from "../src/lib/static-security-headers.ts";

import test from "node:test";

// DESIRED_HTTP_HEADERS records the frame-ancestors-equivalent (X-Frame-Options
// DENY) so the desired policy is explicit and versioned. App Platform static
// cannot emit arbitrary response headers; this is an honest desire, not a claim
// the current static host enforces it.
test("desired HTTP headers include clickjacking control (X-Frame-Options DENY)", () => {
  assert.equal(
    DESIRED_HTTP_HEADERS["X-Frame-Options"],
    "DENY",
    "X-Frame-Options DENY missing from desired headers",
  );
  assert.match(DESIRED_HTTP_HEADERS["X-Content-Type-Options"], /nosniff/);
  assert.match(DESIRED_HTTP_HEADERS["Referrer-Policy"], /strict-origin-when-cross-origin/);
  assert.match(DESIRED_HTTP_HEADERS["Permissions-Policy"], /camera=\(\)/);
});
