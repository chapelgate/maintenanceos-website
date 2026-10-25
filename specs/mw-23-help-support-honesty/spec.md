# mw-23-help-support-honesty

## Problem

Help FAQ and Getting Help published a live Enterprise phone, a placeholder London number, and plan response-time tables while the site is pre-launch and has no public support phone.

## Cause

Help MDX was written as if a staffed support desk were already live.

## Acceptance

- `src/content/help/faq.mdx` and `src/content/help/getting-help.mdx` do not publish `24/7/365`, `Enterprise only (24/7`, `+44 20 3XXX`, or `2-hour response`.
- Both pages say there is no public support phone and that the page is not a live support desk or live SLA.
- Getting Help still points gas emergencies to `0800 111 999` and fire or immediate danger to `999`.
- `node --test scripts/help-support-honesty.test.mjs scripts/help-price-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs` exits 0.
