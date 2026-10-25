# mw-19-security-txt-lock

## Problem

`public/.well-known/security.txt` is the disclosure contact file, but nothing fails the build if Contact, Expires, or Canonical disappear, or if a bounty promise appears.

## Cause

The file was checked by review, not by a dedicated lock test on this cut.

## Acceptance

- `scripts/security-txt-lock.test.mjs` locks Contact, Expires, Canonical, and refuses bounty, response-time, and price claims.
- `node --test scripts/security-txt-lock.test.mjs` exits 0.
