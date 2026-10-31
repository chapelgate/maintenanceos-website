# MaintenanceOS website security review

**Updated:** 2026-10-31
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
- Repository dependency audit on 2026-10-31 after mw-298: Next.js patched to
  **16.4.3** and zod overridden to **4.6.7**. Native `npm audit` reports
  **critical/high cleared** (0 critical, 0 high). Residual **16 moderate**
  findings remain in the eslint/minimatch **dev** toolchain; npm's suggested
  "fix" downgrades eslint to 4.x and is rejected. Residual moderates are
  tracked for a later toolchain bump, not claimed cleared.
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

## 2026-09-27 live re-verification

A cache-bypassed live header audit confirmed that the current DigitalOcean static
origin returns none of the desired arbitrary security response headers above.
The exported HTML still carries the enforcing meta CSP and referrer policy.

Current DigitalOcean App Platform documentation exposes static-site CORS controls,
but no supported arbitrary response-header field for this static component shape.
DigitalOcean also documents that App Platform does not itself emit HSTS; the
current `.ondigitalocean.app` hostname benefits from browser HSTS preload because
the `.app` TLD is preloaded. That is transport behaviour, not an HSTS-header claim.

Executable verification: `npm run security:live`.

## Launch disposition

Engineering investigation is complete. This gap does not justify mutating the
current healthy static architecture or adding duplicate infrastructure. Before
public launch, the residual response-header/clickjacking risk must either:

1. be explicitly accepted by the launch owner/security reviewer; or
2. be resolved through a separately reviewed supported hosting/edge change.

Do not mark arbitrary HTTP security headers as live until the strict executable
gate (`REQUIRE_SECURITY_HEADERS=1 npm run security:live`) actually passes.

## Evidence

- `docs/security/static-security-baseline.md`
- `docs/STEP48_DEPLOYMENT_VERIFICATION.md`
- `docs/STEP49_RELEASE_ROLLBACK.md`
- `PRODUCT_CLAIMS_REGISTER.md`
- `WEBSITE_LAUNCH_CHECKLIST.md`
