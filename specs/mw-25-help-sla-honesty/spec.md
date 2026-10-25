# mw-25-help-sla-honesty

## Problem

Help still publishes a dedicated 24/7 support desk and a 99.9% uptime SLA, and billing says MaintenanceOS is UK VAT registered, while the site is pre-launch and does not publish those facts.

## Cause

Operations and billing help was written as if a staffed desk, an uptime promise, and a VAT registration were already public.

## Acceptance

- `emergency-procedures.mdx` does not say `Dedicated 24/7 support desk` or `24/7 availability`.
- `billing-subscriptions.mdx` does not say `99.9%` or `UK VAT registered`.
- Both pages keep an honesty line: not a live support desk, or not a live SLA.
- `node --test scripts/help-sla-honesty.test.mjs scripts/help-price-honesty.test.mjs scripts/help-support-honesty.test.mjs scripts/font-preload.test.mjs` exits 0.
