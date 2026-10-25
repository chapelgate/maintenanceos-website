# mw-31-help-live-subpages

## Problem

Five help pages still published live setup steps and capabilities:
- notification-settings: Slack app install, webhook events, test buttons
- troubleshooting: Settings → Integrations walks, API key steps, test events
- tenant-portal: yourcompany.maintenanceos.co.uk, enable steps, analytics
- reports-analytics: reports menu, API rate limit 100/min, audit exports
- mobile-app: PWA install/offline/push, native app plans

## Cause

These pages were written as if features were already live.

## Acceptance

- All five pages no longer publish live setup steps, subdomains, rate limits, or feature details.
- Each page says the feature is not live / not applicable.
- Lock test scripts/help-live-subpages.test.mjs passes.
- Full npm test 630 pass.
