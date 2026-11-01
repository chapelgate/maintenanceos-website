# Spec: mw-315 Step-49 SHA honesty test

## Problem
STEP49_RELEASE_ROLLBACK.md documents a live verification at SHA `e113eb7d08c99910bb83b0eb3f5a96cbfa745c2a` but does not bind it to the current HEAD. A test should verify that the claimed live SHA is recorded honestly and traceable from this repo.

## Scope
- Add `scripts/step49-sha-honesty.test.mjs` that:
  - Parses the documented live SHA from STEP49_RELEASE_ROLLBACK.md
  - Verifies the SHA exists in local git history (ancestor of current HEAD)
  - Does NOT claim the live deployment is this HEAD
  - Passes when the documented SHA is a valid ancestor; fails if SHA is missing, malformed, or not in history
- No behaviour change; test-only

## Out of scope
- Deploying or verifying live host
- Changing STEP49_RELEASE_ROLLBACK.md content
- publicLaunch, nginx, deploy

## Acceptance
- step49-sha-honesty test passes
- npm test / lint / typecheck / build green
- publicLaunch remains false; no frozen paths
