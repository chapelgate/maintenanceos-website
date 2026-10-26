# mw-43-help-faq

## Problem

`src/content/help/faq.mdx` still publishes hosting vendors, a DPO inbox, a Settings export path, a regulation catalogue, Welsh portal claims, and migration offers that are not live on this site.

## Acceptance

- Keep `no published price list`, `request`, `not a live integration`, `not a live app`, and `Not a public always-on phone`.
- Do not name DigitalOcean, Cloudflare, a DPO inbox, Settings →, or a regulation coverage list.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-faq.test.mjs scripts/help-live-integrations.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
