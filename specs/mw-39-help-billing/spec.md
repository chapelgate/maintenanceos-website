# mw-39-help-billing

## Problem

`src/content/help/billing-subscriptions.mdx` still names card and direct-debit processors, a settings path, retry and deletion clocks, invoice numbers, seat rules, and phantom next-step pages. The site has no published price list and no self-serve checkout.

## Acceptance

- The article keeps "no published price list", a request for pricing, "not a live SLA", and "does not publish a VAT number".
- It does not name a payment processor, a settings path, a deletion clock, a plan name, or a missing next-step page.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-billing-subscriptions.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/help-phantom-channels.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
