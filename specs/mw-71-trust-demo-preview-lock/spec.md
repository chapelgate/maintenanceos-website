# mw-71-trust-demo-preview-lock

## Problem
Trust page voice section uses "Live demo number (when enabled)" and "Available 24/7 for greeting", implying a public live always-on phone service.

## Acceptance
- Trust page uses "Preview demo number (when enabled)".
- Trust page denies public 24/7 answering service and live always-on phone.
- `node --test scripts/trust-demo-preview-lock.test.mjs` exits 0.