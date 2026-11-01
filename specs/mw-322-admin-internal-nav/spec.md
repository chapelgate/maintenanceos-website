# Spec: mw-322 admin internal navigation

## Problem
`/admin/` lists flags and Andy gates but does not link the internal reviewer to the related synthetic demo surfaces (`/buyers/`, `/onboarding/`, `/accessibility/`) or note the frozen scanner.

## Scope
- Add an internal-nav section with links to buyers, onboarding, accessibility, status
- Add one honesty line that the onboarding scanner is frozen (t835u) and not operated from this page
- Extend `scripts/admin-honesty.test.mjs`

## Out of scope
- Scanner code/endpoints (frozen)
- publicLaunch flip, deploy, nginx, golden line

## Acceptance
- admin-honesty tests pass
- npm test (scripts) / lint / typecheck green
- publicLaunch remains false
