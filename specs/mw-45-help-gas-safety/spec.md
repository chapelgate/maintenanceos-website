# mw-45-help-gas-safety

## Problem

`src/content/help/gas-safety-compliance.mdx` still describes Gas Safe API verification, CP12 workflows, remedial auto-links, and phantom next-step pages. None of that is a published compliance tool.

## Acceptance

- The article says gas safety certificates, scheduling, and engineer verification are not published, and that this is not a live compliance tool.
- It does not name Gas Safe API, CP12, a Settings or Reports path, or a missing next-step page.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-gas-safety-compliance.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
