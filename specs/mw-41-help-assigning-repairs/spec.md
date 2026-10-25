# mw-41-help-assigning-repairs

## Problem

`src/content/help/assigning-repairs.mdx` still describes a live assign button, a weighted matching table, SMS notification, bulk assign, emergency acknowledgement, and phantom next-step pages. None of that is a published assignment flow.

## Acceptance

- The article says repair assignment, matching, and contractor availability are not published, and that this is not a live assignment flow.
- It does not name an assign button, a percentage weight, an SMS path, a postcode match, or a missing next-step page.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-assigning-repairs.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
