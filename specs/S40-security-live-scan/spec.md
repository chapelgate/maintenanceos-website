# S40: Automated Security Scanning in CI

## Summary
Add `npm run security:live` to GitHub Actions PR checks so that PRs fail if security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are missing from the live site.

## Background
The `scripts/live-security-audit.mjs` script already exists and checks the live site for required security headers. It can run in strict mode (`REQUIRE_SECURITY_HEADERS=1`) which fails if any required HTTP security headers are missing.

## Solution
Create a new GitHub Actions workflow (`.github/workflows/security.yml`) that runs on every PR and push to main. The workflow will:
1. Checkout the code
2. Install dependencies
3. Run `npm run security:live` with `REQUIRE_SECURITY_HEADERS=1` pointing to the live site

## Acceptance Criteria
- PR check runs `security:live` on every PR
- PR fails if HSTS/CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy headers are missing from the live site
- Workflow passes when all required headers are present