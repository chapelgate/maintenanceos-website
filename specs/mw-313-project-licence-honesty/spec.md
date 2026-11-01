# Spec: mw-313 project licence honesty

## Problem
The project is pre-launch and proprietary (`"private": true` in package.json) but has no LICENSE file and no public licence claim. Honesty tests should verify this state to prevent accidental open-source claims.

## Scope
- Add scripts/project-licence-honesty.test.mjs asserting:
  - package.json has `"private": true`
  - No "license": "MIT" (or similar) in package.json
  - No LICENSE or LICENCE file in repo root
  - README does not claim MIT/Apache/other open licence

## Out of scope
- Adding a LICENSE file.
- Changing private status.
- Third-party dependency licences (handled by mw-1023/mw-1024).

## Acceptance
- project-licence-honesty tests pass
- npm test / lint / typecheck / build green
- No frozen paths modified
