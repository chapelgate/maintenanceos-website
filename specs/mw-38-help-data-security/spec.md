# mw-38-help-data-security

## Problem

`src/content/help/data-security.mdx` states encryption methods, a key store, seven-year retention, a privacy-request path, Cyber Essentials, penetration testing, a bug-bounty programme, and incident response times as if they were published. Those claims are not proved on this pre-launch site.

## Acceptance

- The article says encryption, retention, certifications, privacy requests, and incident targets are not published.
- It does not name a cipher, a key service, a certification, a bug-bounty host, a DPO inbox, a settings path, or a response-time number.
- The frontmatter description is 160 characters or fewer.
- `node --test scripts/help-data-security.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
