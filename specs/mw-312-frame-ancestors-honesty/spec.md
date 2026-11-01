# Spec: mw-312 frame-ancestors honesty guard

## Problem
Lighthouse CI / security review notes that `frame-ancestors` cannot be enforced as HTTP header on DigitalOcean App Platform static export (`output: 'export'`). The honest baseline documents this gap and blocks unverified claims.

## Scope
- Document in docs/security/static-security-baseline.md that meta-CSP ignores frame-ancestors; no HTTP header path is invented.
- Add scripts/frame-ancestors-honesty.test.mjs.
- Keep DO NOT invent headers path.

## Out of scope
- public/_headers, app.yaml, .do/, Next.js headers(), service components, X-Frame-Options, X-Content-Type-Options.
- Deploy/nginx. publicLaunch flip.

## Acceptance
- frame-ancestors-honesty test passes
- docs/security/static-security-baseline.md gap documented honestly
- npm test / lint / typecheck / build green
- No frozen paths modified
