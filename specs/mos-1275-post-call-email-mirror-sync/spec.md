# mos-1275-post-call-email-mirror-sync
FEATURE: sync post-call email worker mirror to canonical files

## What
Worker bundle drifted on call_notifications (C0 transcript helpers), so test_post_call_email_sync went red.

## Acceptance
- all four sync pairs byte-identical
- test_post_call_email_sync passes
