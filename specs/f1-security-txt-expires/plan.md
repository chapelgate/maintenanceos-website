# Plan for F1: security.txt Expires line per RFC 9116

## Steps
1. Add `Expires: 2027-10-20T23:00:00.000Z` to `public/.well-known/security.txt`
2. Add `Preferred-Languages: en` to `public/.well-known/security.txt`
3. Add `Canonical: https://worksmartos.co.uk/.well-known/security.txt` to `public/.well-known/security.txt`
4. Add RFC 9116 test to `scripts/audit-slices.test.mjs` asserting Contact, Expires, Preferred-Languages, Canonical lines
5. Run `npm ci` to verify install
6. Run `npx tsc --noEmit` to verify TypeScript clean
7. Run `npm run lint` to verify lint clean
8. Run `node --test scripts/audit-slices.test.mjs` to verify tests pass (9/9)
9. Run `npm run build` to verify build exits 0
10. Commit and push branch feat/f1-security-txt-expires
11. Open PR with required Estate headers and Skills used line
12. Wait for estate-gate, validate, webkit-a11y green
13. Merge with gh pr merge --squash
14. Run live acceptance test after redeploy: `curl -f https://worksmartos.co.uk/.well-known/security.txt | grep -q "Expires:"`
