# mos-1028-generic-secret-token-redact

## Goal
Redact GitHub OAuth/user/session tokens, npm tokens, and Slack xoxe tokens across HTTP errors, audit detail, and operational logs.

## Acceptance
- gho_/ghu_/ghs_/npm_/xoxe- tokens become [REDACTED] in all three redactors
- dedicated pytest module passes for all three redactors
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
