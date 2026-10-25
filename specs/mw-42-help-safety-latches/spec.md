# mw-42-help-safety-latches

## Problem

`src/content/help/safety-latches.mdx` still describes automatic safety holds, statutory repair targets, officer clocks, and a settings test tool. None of that is a published safety latch.

## Acceptance

- The article says safety holds, officer review, and statutory repair rules are not published, and that this is not a live safety latch.
- It does not name a regulation, a response clock, an SMS alert, a settings path, or a missing next-step page.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-safety-latches.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
