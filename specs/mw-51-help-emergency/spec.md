# mw-51-help-emergency

## Problem
`src/content/help/emergency-procedures.mdx` still publishes product escalation, rotas, and runbooks as live behaviour.

## Acceptance
- The article keeps public emergency numbers 0800 111 999 and 999, and states there is no dedicated 24/7 support desk and this is not a live support desk or safety tool.
- It does not publish product contractor selection, mandatory photo rules, or Settings/Reports paths.
- Frontmatter description ≤ 160 chars.
- `node --test scripts/help-emergency-procedures.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
