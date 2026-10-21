# Tasks for F1: security.txt Expires line per RFC 9116

- [x] Add Expires, Preferred-Languages, Canonical to public/.well-known/security.txt
- [x] Add RFC 9116 test to scripts/audit-slices.test.mjs
- [x] Run npm ci - PASS
- [x] Run npx tsc --noEmit - PASS
- [x] Run npm run lint - PASS (0 errors)
- [x] Run node --test scripts/audit-slices.test.mjs - PASS (9/9)
- [x] Run npm run build - PASS (exit 0)
- [x] Commit and push branch feat/f1-security-txt-expires
- [x] Open PR with Estate headers and Skills used line
- [x] Wait for estate-gate, validate, webkit-a11y green
- [x] Merge with gh pr merge --squash
- [x] Run live acceptance test after redeploy
