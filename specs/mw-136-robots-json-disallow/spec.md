# mw-136-robots-json-disallow

## Goal
Ensure robots.txt disallows /status.json and /release.json for honesty and security.

## Acceptance
- node --test scripts/robots-json-disallow.test.mjs passes.
- robots.ts disallow array includes both paths.
