# mw-298: dependency security patch

## Summary
Patch Next.js past the 16.3.x–16.4.0 critical/high advisory window and pin zod to a patched 4.6.7 release. Refresh third-party licence evidence and honesty docs so the lockfile hash stays authoritative.

## Requirements
- `next` is 16.4.3 in package.json and package-lock.json
- `overrides.zod` is 4.6.7 and lockfile zod is 4.6.7
- `docs/THIRD_PARTY_RELEASE_EVIDENCE.md` and `scripts/licence-evidence.test.mjs` bind to the new lockfile hash
- Security review and launch checklist no longer claim "0 known vulnerabilities" after residual eslint moderate findings remain
- `npm audit:ci` passes with residual moderates accepted as tracked, not claimed cleared
- Frozen paths (deploy/, nginx, voice, production DBs) untouched

## Acceptance Criteria
- `npm test` exit 0
- `npx tsc --noEmit` exit 0
- `npm run audit:ci` exit 0
- Native audit shows 0 critical and 0 high
