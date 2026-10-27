# mw-138-ai-txt-release-align

## Goal
.ai.txt honesty markers must align with /release.json and /status.json denials.

## Acceptance
- node --test scripts/ai-txt-honesty.test.mjs passes
- public/.well-known/ai.txt includes public_launch/commercial_ga/live_phone/sla_claim false
