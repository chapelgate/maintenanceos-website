# mw-99-chat-widget-no-fake-delivery

## Goal
The chat widget must not fake message delivery or imply a live chat desk on the static site.

## Acceptance
- `node --test scripts/chat-widget-no-fake-delivery.test.mjs` passes.
- Widget has no submit form, no success/submitting theatre, and states no message is delivered from the panel.
