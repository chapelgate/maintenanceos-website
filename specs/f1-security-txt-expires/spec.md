# F1: security.txt Expires line (RFC 9116)

## Problem
`public/.well-known/security.txt` only contains a `Contact:` line. RFC 9116 requires an `Expires:` line. Missing Expires means the security policy is not time-bounded.

## Solution
Add `Expires: 2027-10-20T23:00:00.000Z`, `Preferred-Languages: en`, and `Canonical: https://worksmartos.co.uk/.well-known/security.txt` to `public/.well-known/security.txt`.

## Acceptance Criteria
- `curl -f https://worksmartos.co.uk/.well-known/security.txt | grep -q "Expires:"` exits 0
- `npm run build` exits 0
- `node --test scripts/audit-slices.test.mjs` passes (new test asserts Expires, Preferred-Languages, Canonical)

## Skills used
poteto-mode, verification-before-completion, no-comments
