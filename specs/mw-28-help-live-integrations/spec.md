# mw-28-help-live-integrations

## Problem

Help still told readers to create a live API key and to connect named products such as Reapit, Xero, and Slack. The FAQ also said a mobile app could be installed and worked offline.

## Cause

Integration and FAQ articles were written as if API keys, pre-built connectors, and an installable app were already public.

## Acceptance

- `faq.mdx` does not say `Yes. Pre-built:` and does not say the app works offline with push notifications. It says the integration catalogue and the app are not live.
- `api-quickstart.mdx` does not say `Create API Key` or `Log into MaintenanceOS as Admin`. It says there is no API key screen and not a live API key.
- `integration-overview.mdx` does not publish `100 req/min`, `Reapit`, `Authorise`, or `OAuth 2.0`. It says there is no API key screen and named connectors are not a live catalogue.
- The Webhooks heading remains on the integration page.
- `node --test scripts/help-live-integrations.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-support-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/help-price-honesty.test.mjs scripts/font-preload.test.mjs` exits 0.
