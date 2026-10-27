# mos-1028-ops-log-slack-token-redact

## Goal
Redact Slack tokens (xoxb-/xoxp-/…) in operational_logging._redact.

## Acceptance
- Slack-shaped tokens become [REDACTED]
- tests/test_ops_log_slack_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
