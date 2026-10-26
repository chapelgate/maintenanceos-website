# mw-53-help-getting-help-depth

## Problem
`src/content/help/getting-help.mdx` still publishes in-product help surfaces, an early-access inbox, and unpublished next-step links.

## Acceptance
- The article keeps no public support phone / not a live support desk / not a live SLA, and public emergency numbers 0800 111 999 and 999.
- It does not name contextual help, guided tours, early-access@maintenanceos.co.uk, or unpublished next-step slugs.
- Frontmatter description ≤ 160 chars.
- `node --test scripts/help-getting-help-depth.test.mjs scripts/help-support-honesty.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
