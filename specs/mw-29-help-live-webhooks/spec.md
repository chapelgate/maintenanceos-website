# mw-29-help-live-webhooks

## Problem

Integration help still publishes webhook delivery, an endpoint catalogue, a sandbox workspace, and rate-limit handling as if those are available.

## Cause

The overview kept procedure sections after the connector catalogue was removed.

## Acceptance

- `integration-overview.mdx` does not say `Events available:`, `Sandbox workspace`, or `Settings → Integrations → Webhooks`.
- It says webhook delivery, the sandbox, and the rate limit are not live.
- It still says named connectors are not a live catalogue and there is no API key screen.
- The Webhooks and Next Steps headings remain.
- `node --test scripts/help-live-webhooks.test.mjs scripts/help-live-integrations.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-support-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/help-price-honesty.test.mjs scripts/font-preload.test.mjs` exits 0.
