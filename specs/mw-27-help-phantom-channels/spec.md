# mw-27-help-phantom-channels

## Problem

Help still publishes a public API host, an app host, a support inbox, and an accessibility inbox, and Getting Help still offers an in-app feedback desk and an admin onboarding call.

## Cause

Integration, mobile, troubleshooting, and accessibility articles were written as if those channels were already public.

## Acceptance

- No file in `src/content/help` contains `api.maintenanceos.co.uk`, `app.maintenanceos.co.uk`, `support@maintenanceos.co.uk`, or `accessibility@maintenanceos.co.uk`.
- API help says there is no public API host and not a live API.
- Mobile help says there is no app host and not a live app.
- Troubleshooting says there is no public support inbox and not a live response target.
- Accessibility help says it does not publish an accessibility inbox.
- Getting Help does not say `Send Feedback` or `Admin onboarding call`, and it says the feedback channel and onboarding call are not live.
- Gas emergency `0800 111 999` and `early-access@maintenanceos.co.uk` stay on Getting Help.
- `node --test scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-support-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/help-price-honesty.test.mjs scripts/font-preload.test.mjs` exits 0.
