# mw-37-help-configuring-contractors

## Problem

`src/content/help/configuring-contractors.mdx` tells a reader to add contractors at Settings, store Gas Safe and NICEIC numbers, apply hour-based SLA tables, open a contractor portal, and import a CSV. None of that is a published MaintenanceOS contractor network.

## Acceptance

- The article says contractor setup, trade lists, SLA targets, a portal, and CSV import are not published.
- It does not name a settings path, a registration body, an hour target, a performance report, a CSV column, or a missing next-step page.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-configuring-contractors.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-live-subpages.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
