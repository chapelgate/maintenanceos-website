# mw-30-help-live-webhook-guide

## Problem

The Webhook Implementation Guide still reads as if MaintenanceOS publishes webhook delivery, signature headers, event types, retry rules, a sandbox, and a delivery dashboard.

## Cause

The guide was written as if webhooks were already live.

## Acceptance

- `webhook-guide.mdx` does not say `At-least-once delivery`, `Signature Verification`, `Example (Node.js)`, `Example (Python)`, `Events available:`, or `Sandbox workspace`.
- It says webhook delivery, signature verification, event processing, event structure, rate limits, testing, monitoring, pitfalls, and next steps are not live / not applicable.
- `node --test scripts/help-live-webhook-guide.test.mjs scripts/help-live-webhooks.test.mjs scripts/help-live-integrations.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-support-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/help-price-honesty.test.mjs scripts/font-preload.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs` exits 0.
