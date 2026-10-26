# mw-46-help-epc

## Problem

`src/content/help/epc-compliance.mdx` still describes MEES rating tables, certificate tracking, and improvement plans as live product behaviour.

## Acceptance

- The article says EPC tracking is not published, and that this is not a live compliance tool.
- It does not name MEES effective dates, Reports → paths, or auto-warning clocks.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-epc-compliance.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
