# mw-09-disclosure-security-txt

## Problem

The vulnerability disclosure page names an email and does not point at `/.well-known/security.txt`. It also does not say there is no paid bounty.

## Cause

The RFC 9116 file and the human page were written separately.

## Acceptance

- The page links `/.well-known/security.txt`.
- The page mailto matches the `Contact:` line in `public/.well-known/security.txt`.
- The page says there is no paid bug bounty and no response-time promise.
- The page keeps PageHero, metadata, and the existing safe-harbor paragraph.
- The page does not offer a reward.
- `node --test scripts/disclosure-security-txt.test.mjs` exits 0.
