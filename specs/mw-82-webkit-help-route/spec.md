# mw-82-webkit-help-route

## Goal
Include the public /help/ index in WebKit axe coverage so help honesty pages get the same serious/critical a11y gate.

## Acceptance
- `node --test scripts/webkit-help-route.test.mjs` passes.
- /help/ appears in tests/webkit-a11y/a11y.test.mjs pages list.
