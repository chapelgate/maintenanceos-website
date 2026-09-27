# Continuation Step 8 — security hardening

**Date:** 2026-09-27
**Owner:** Security + DevOps + Website Manager
**Baseline:** Step 7 commit `9bbeb7ecb580333a42596e75d62d6d800f5708ab`

## Live findings

The current DigitalOcean static origin was re-checked without cache assumptions.

Present as HTTP response headers:

- content type;
- cache controls.

Not present as HTTP response headers:

- Content-Security-Policy;
- X-Frame-Options;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy;
- Strict-Transport-Security.

The exported HTML continues to carry enforcing meta CSP and
`strict-origin-when-cross-origin` referrer policy. Production meta CSP excludes
`unsafe-eval`.

The current `.ondigitalocean.app` hostname is under the HSTS-preloaded `.app`
TLD, but that is browser transport behaviour and is not represented as an HSTS
response-header claim.

## Platform decision

Current App Platform static-site specifications expose CORS configuration but no
proven arbitrary response-header field for this existing static component shape.
No duplicate app, Node service, proxy or paid edge was introduced just to make a
header checklist green.

## Executable guard

`npm run security:live` now verifies:

- live site availability;
- enforcing meta CSP;
- production CSP has no `unsafe-eval`;
- referrer meta policy;
- actual live response-header inventory.

Set `REQUIRE_SECURITY_HEADERS=1` to make the known response-header gap a hard
failure for a future launch/hosting configuration.

## Launch disposition

Engineering investigation is complete. The residual response-header/clickjacking
risk remains a human launch decision unless a supported hosting/edge change makes
the strict header gate pass.
