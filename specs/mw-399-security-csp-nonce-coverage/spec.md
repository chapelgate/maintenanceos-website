# mw-399 Security and observability honesty

## Goal
Verify that static exports make only enforceable CSP, referrer, SRI, accessibility, release, status, and health-artifact claims.

## Acceptance
- Exported pages contain the configured CSP and referrer metadata.
- Tests reject unsupported clickjacking-header claims and mismatched release/status/health artifacts.
- SRI reporting distinguishes verified and uncovered static resources without claiming enforcement.
- Accessibility coverage claims remain tied to named WCAG 2.2 criteria.
- `npm test`, lint, typecheck, and build pass.
- Public launch remains disabled and no deploy, live nginx, production, voice, or golden-line path changes.
