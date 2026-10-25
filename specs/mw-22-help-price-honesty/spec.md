# mw-22-help-price-honesty

## Problem

Help centre articles listed specific price tiers (£49/month, £149/month, etc.) as if they were current, but the live site is pre-launch with no published price list.

## Cause

Pricing copy was written with published-mode values, not pre-launch framing.

## Acceptance

- `scripts/help-price-honesty.test.mjs` fails the build on £ price-plan claims without `[ANDY:]` or honest pre-launch framing (`quote-led`, `no price list`, `request pricing`).
- Billing copy uses `[ANDY:]` placeholders; FAQ copy uses `[ANDY: monthly per property]` and references `request pricing`.
- `node --test scripts/help-price-honesty.test.mjs` exits 0.
- `node --test scripts/public-copy.test.mjs` exits 0.
