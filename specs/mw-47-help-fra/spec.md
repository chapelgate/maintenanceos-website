# mw-47-help-fra

## Problem

`src/content/help/fire-risk-assessment.mdx` still describes FRA workflows, finding priorities, competent-person checks, portfolio reports, and golden-thread exports as live product behaviour.

## Acceptance

- The article says FRA tracking and golden-thread export are not published, and that this is not a live compliance tool.
- It does not name the Fire Safety Order, auto-warning clocks, priority targets, or phantom next-step pages.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-fra.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
