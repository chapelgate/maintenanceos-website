# mw-48-help-hmo

## Problem

`src/content/help/hmocompliance.mdx` still describes HMO licensing, mandatory conditions, and inspection readiness as live product behaviour.

## Acceptance

- The article says HMO licensing is not published, and that this is not a live compliance tool.
- It does not name occupant thresholds, licence numbers, or Reports → paths.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-hmo-compliance.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
