# mw-116-contact-funnel-honesty

## Goal
Contact funnel must deny GA support desk and live phone provisioning so visitors cannot read the page as a live support channel (REVIEW-rd2 honesty / left-to-release item 1).

## Acceptance
- `node --test scripts/contact-funnel-honesty.test.mjs` passes.
- `node --test scripts/contact-channel-clarity.test.mjs scripts/contact-business-hours-honesty.test.mjs` still pass.
