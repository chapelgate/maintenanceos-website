# mw-36-help-getting-started

## Problem

`src/content/help/getting-started.mdx` tells a reader to create a workspace, add properties, import a CSV, invite a team, configure repair categories, set safety rules with SLAs, connect channels including Twilio and API, and run a test repair. None of that is a published MaintenanceOS onboarding. It also links to help pages that do not exist.

## Acceptance

- The article says workspaces, properties, invites, safety rules, channels, and test repairs are not published.
- It does not name a live settings path, an identity provider, a CSV import, a gas certificate, EPC, HMO field, a default category, a safety rule with an SLA, a Twilio phone, an API channel, a test repair, or a missing help page.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-getting-started.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-live-subpages.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.