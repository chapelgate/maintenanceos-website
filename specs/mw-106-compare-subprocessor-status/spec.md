# mw-106-compare-subprocessor-status

## Goal
Compare pages must not present Twilio, SendGrid, Google, or Cloudflare as live website subprocessors. Align with the draft/planned register on /subprocessors/.

## Acceptance
- `node --test scripts/compare-subprocessor-status.test.mjs` passes.
- No frozen paths, deploy, nginx, launch flag, or golden line changes.
