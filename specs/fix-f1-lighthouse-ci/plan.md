# Plan for F1: Add Lighthouse CI gate workflow for /, /pricing/, /create/, /contact/

## Steps
1. Rebase fix/f1-lighthouse-ci onto origin/main (c77a030)
2. Verify no type errors on current main (`npx tsc --noEmit`)
3. Write specs/fix-f1-lighthouse-ci/spec.md, plan.md and tasks.md
4. Build the site and run Lighthouse locally on /, /pricing/, /create/, /contact/ (mobile, headless Chrome)
5. Record the four category scores per page into FIX_STATE_F1.md
6. If any category score < 90, fix the site (never lower the bar) and re-run Lighthouse
7. Run local `npm ci && npx tsc --noEmit && npm run lint && npm test && npm run build`
8. Validate `git diff --check origin/main HEAD` is clean (no trailing whitespace)
9. Commit and push fix/f1-lighthouse-ci (force-with-lease on that branch only)
10. Update PR #339 body: Estate-Preflight, Estate-Route, Estate-Artifact, Estate-Converged, then "Skills used: poteto-mode, verification-before-completion, no-comments", then summary and real Lighthouse scores
11. Wait for estate-gate, validate, webkit-a11y and lighthouse green on PR head (`gh pr checks 339 --watch`)
