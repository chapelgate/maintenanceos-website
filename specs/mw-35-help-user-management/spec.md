# mw-35-help-user-management

## Problem

`src/content/help/user-management.mdx` tells a reader to invite users, upload a CSV, configure Okta or Azure AD, turn on SCIM, and export a seven-year audit log. None of that is a published MaintenanceOS control. It also links to help pages that do not exist.

## Acceptance

- The article says invites, roles, single sign-on, sessions, and audit export are not published.
- It does not name a live settings path, an identity provider, SCIM, a magic link, a session timeout, or a missing help page.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-user-management.test.mjs scripts/help-phantom-channels.test.mjs scripts/wcag-claim-lock.test.mjs` exits 0.
