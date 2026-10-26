# mw-103-help-early-access-email-honesty

## Goal
Help FAQ and Getting Help must use the canonical public enquiry email (`info@chapelgatetechnologies.com`) and must not invent `@maintenanceos.co.uk` mailboxes.

## Acceptance
- `node --test scripts/help-early-access-email-honesty.test.mjs scripts/help-faq.test.mjs scripts/help-getting-help-depth.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-support-honesty.test.mjs` passes.
- No frozen paths, deploy, nginx, launch flag, or golden line changes.
