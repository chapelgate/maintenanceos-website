# mw-10-andy-demo-script

## Problem

There is no checked-in script for a synthetic pre-launch walkthrough of the marketing site.

## Cause

Demo steps lived in review notes, not in the repo.

## Acceptance

- `docs/demo/ANDY_SYNTHETIC_DEMO.md` tells Andy to keep public launch off, not to call the golden line, and not to enter a live customer record.
- It checks home, /demo/, /pricing/, /status/, /contact/, and an unknown path.
- It does not publish a price or claim WCAG 2.2 AA is verified.
- `node --test scripts/andy-demo-script.test.mjs` exits 0.
