# mw-44-help-release-notes

## Problem

`src/content/help/release-notes.mdx` still publishes versioned feature lists, channel cadences, Settings → subscribe paths, and phantom next-step pages. None of that is a published changelog.

## Acceptance

- The article says versioned release notes are not published, and that this is not a live changelog.
- It does not name a version number, Gas Safe API, Settings → path, or a missing next-step page.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-release-notes.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
