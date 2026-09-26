# MaintenanceOS website security review

**Updated:** 2026-09-26
**Scope:** public/pre-launch marketing website and its website-only companion contracts
**Status:** engineering review complete; one known hosting-header gap remains open for launch review

## Verified controls

- Static export remains isolated from the MaintenanceOS voice/product runtime.
- Enforcing HTML CSP and Referrer Policy are emitted by the exported pages.
- Production CSP excludes `unsafe-eval`.
- Website URL ingest is SSRF-defended and re-checks DNS/redirect targets.
- Lead intake has validation, honeypot handling, rate limiting, durable storage
  before notification, and an origin allowlist on the existing control plane.
- Optional website companions default off and must not claim live telephony.
- `NEXT_PUBLIC_*` values are treated as public build-time configuration, not secrets.
- Repository dependency audit on 2026-09-26: **0 known vulnerabilities** at
  `--audit-level=moderate`.
- Common committed-secret pattern scan on 2026-09-26 found no API-key/private-key
  patterns in tracked source.

## Known host limitation

DigitalOcean App Platform static hosting does not currently provide the
repository with a safe, proven way to emit the desired arbitrary HTTP response
headers without changing the hosting shape.

Therefore these are **not claimed live**:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- HTTP CSP with `frame-ancestors 'none'`
- `Permissions-Policy`

The HTML CSP cannot enforce `frame-ancestors`; clickjacking response-header
protection is the remaining documented hosting gap. Do not add fake meta tags,
`public/_headers`, incompatible Next `headers()`, a duplicate hosting app, or
a Node service merely to make the checklist look green.

## Launch disposition

This gap does not justify mutating the current healthy staging architecture in
a documentation pass. Before public launch, Security/DevOps must either:

1. prove a supported response-header configuration on the existing hosting path; or
2. explicitly accept the residual static-host risk for launch; or
3. move hosting only through a separately reviewed architecture change.

## Evidence

- `docs/security/static-security-baseline.md`
- `docs/STEP48_DEPLOYMENT_VERIFICATION.md`
- `docs/STEP49_RELEASE_ROLLBACK.md`
- `PRODUCT_CLAIMS_REGISTER.md`
- `WEBSITE_LAUNCH_CHECKLIST.md`
