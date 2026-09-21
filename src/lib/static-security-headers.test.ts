import assert from "node:assert/strict";
import test from "node:test";
import {
  CONTENT_SECURITY_POLICY,
  CONTENT_SECURITY_POLICY_HTTP,
  DESIRED_HTTP_HEADERS,
  REFERRER_POLICY,
  contentSecurityPolicy,
} from "./static-security-headers.ts";

test("production CSP allows the static funnel without unsafe-eval or third-party fonts", () => {
  const csp = contentSecurityPolicy("production");
  assert.equal(csp, CONTENT_SECURITY_POLICY);
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self' 'unsafe-inline'/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
  assert.match(csp, /font-src 'self'/);
  assert.match(csp, /img-src 'self' data:/);
  assert.match(csp, /connect-src 'self' https: http:\/\/127\.0\.0\.1:\* http:\/\/localhost:\*/);
  assert.match(csp, /form-action 'self' https:/);
  assert.match(csp, /frame-src 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
  assert.doesNotMatch(csp, /unsafe-eval/);
  assert.doesNotMatch(csp, /fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr|unpkg/);
  assert.doesNotMatch(csp, /upgrade-insecure-requests/);
  assert.doesNotMatch(csp, /frame-ancestors/);
  assert.doesNotMatch(csp, /Report-Only|report-uri|report-to/);
});

test("development CSP only adds eval and websockets for next dev", () => {
  const csp = contentSecurityPolicy("development");
  assert.match(csp, /script-src 'self' 'unsafe-inline' 'unsafe-eval'/);
  assert.match(csp, /connect-src[^;]+ws: wss:/);
  assert.notEqual(csp, CONTENT_SECURITY_POLICY);
});

test("HTTP-only complement documents nosniff, DENY, and frame-ancestors", () => {
  assert.equal(REFERRER_POLICY, "strict-origin-when-cross-origin");
  assert.equal(DESIRED_HTTP_HEADERS["X-Content-Type-Options"], "nosniff");
  assert.equal(DESIRED_HTTP_HEADERS["X-Frame-Options"], "DENY");
  assert.equal(DESIRED_HTTP_HEADERS["Referrer-Policy"], REFERRER_POLICY);
  assert.match(DESIRED_HTTP_HEADERS["Permissions-Policy"], /camera=\(\)/);
  assert.match(CONTENT_SECURITY_POLICY_HTTP, /frame-ancestors 'none'/);
  assert.ok(CONTENT_SECURITY_POLICY_HTTP.startsWith(CONTENT_SECURITY_POLICY));
});
