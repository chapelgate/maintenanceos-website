# mw-40-help-contractor-compliance

## Problem

`src/content/help/contractor-compliance.mdx` still names certification bodies, insurance minimums, expiry clocks, suspension, a settings path, and phantom next-step pages. None of that is a published compliance scheme.

## Acceptance

- The article says certifications, insurance, and renewal workflows are not published, and that this is not a live compliance scheme.
- It does not name a register, an insurance sum, an SMS warning, a settings path, or a missing next-step page.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-contractor-compliance.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
