# mw-22-help-price-honesty

## Problem

Help FAQ and billing articles published Starter/Professional pound prices and a 50% early-access discount while the marketing site correctly keeps packages quote-led with no published list.

## Cause

Help MDX was written as if self-serve billing were live.

## Acceptance

- FAQ and billing help pages publish no `£` product prices and no `50% off` offer.
- `scripts/help-price-honesty.test.mjs` locks that.
- `scripts/wcag-claim-lock.test.mjs` remains on the branch (must not be renamed away).
- `node --test scripts/help-price-honesty.test.mjs scripts/wcag-claim-lock.test.mjs` exits 0.
