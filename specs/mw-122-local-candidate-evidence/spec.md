# mw-122-local-candidate-evidence

## Goal
Record SHA-bound local candidate evidence for secret-scan policy, rollback, health-monitor opt-in, and publicLaunch fail-closed without deploying (REVIEW-rd2 left #5).

## Acceptance
- npm run candidate:evidence writes candidate-evidence.json for HEAD.
- node --test scripts/candidate-evidence.test.mjs passes.
- No deploy/nginx/PUBLIC_LAUNCH.
