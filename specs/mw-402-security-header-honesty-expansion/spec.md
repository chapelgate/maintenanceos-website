# mw-402 Security header honesty expansion

## Goal
Extend CSP and security header honesty validation across all exported pages, supporting the REVIEW-rd2.md security engineering 8→9/10 goal.

## Acceptance
- All exported pages contain CSP meta and referrer policy
- CSP meta does not falsely claim frame-ancestors or unsafe-eval enforcement
- CSP meta includes strict-origin-when-cross-origin referrer
- Security page documents missing headers honestly (no false claims)
- No X-Frame-Options meta tag in exported HTML
- CSP structure consistent across all exported pages
- Health artifact cross-validates with release + status markers
- `npm test`, lint, typecheck, and build pass
- Public launch remains disabled and no deploy, live nginx, production, voice, or golden-line path changes