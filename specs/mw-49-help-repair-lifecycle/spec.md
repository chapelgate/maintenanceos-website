# mw-49-help-repair-lifecycle

## Problem

`src/content/help/repair-lifecycle.mdx` still publishes a live status table with duration targets and role transitions.

## Acceptance

- The article says repair statuses are not published, and that this is not a live repair workflow.
- It does not name duration clocks or status names as live product behaviour.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-repair-lifecycle.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
