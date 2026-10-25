# Tasks for F1: Add Lighthouse CI gate workflow for /, /pricing/, /create/, /contact/

- [x] Rebase fix/f1-lighthouse-ci onto origin/main (c77a030) - DONE
- [x] Verify no type errors on current main (npx tsc --noEmit) - DONE
- [x] Write specs/fix-f1-lighthouse-ci/spec.md, plan.md and tasks.md - DONE
- [x] Run Lighthouse locally on /, /pricing/, /create/, /contact/ (mobile headless Chrome)
- [x] Record the four category scores per page into FIX_STATE_F1.md
- [x] If any category score < 90, fix the site and re-run Lighthouse
- [x] Run local npm ci && npx tsc --noEmit && npm run lint && npm test && npm run build - DONE
- [x] Validate git diff --check origin/main HEAD is clean (no trailing whitespace) - DONE
- [x] Commit and push fix/f1-lighthouse-ci (force-with-lease on that branch only)
- [x] Update PR #339 body
- [x] Wait for estate-gate, validate, webkit-a11y and lighthouse green on PR head
- [x] Write FINAL FIX_STATE_F1.md and PASS to /root/jobs-work/wso-crr-fix-r1-f1/out/MISSION_COMPLETE