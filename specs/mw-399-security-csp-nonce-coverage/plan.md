# Plan mw-399

- Add test suite: scripts/csp-nonce-honesty.test.mjs verifying meta CSP, referrer policy, and honest gap documentation.
- Add test suite: scripts/status-release-consistency.test.mjs verifying status.json, release.json, and health artifact alignment.
- Extend SRI verification: scripts/sri-verification.test.mjs and scripts/sri-verifier.mjs for honest coverage reporting.
- Update security page: src/app/security/page.tsx with explicit clickjacking gap.
- Update accessibility page: src/app/accessibility/page.tsx with WCAG 2.2 AA coverage table.
- Ensure all scripts run under `npm test` with node --test.
- Verify lint, typecheck, build pass locally before PR.