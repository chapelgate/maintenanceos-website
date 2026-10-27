# mos-1028-http-error-slack-token-redact

## Goal
Redact Slack tokens (xoxb-/xoxp-/xoxa-/xoxr-/xoxs-) in HTTP error details.

## Acceptance
- Slack-shaped tokens become [REDACTED]
- tests/test_http_error_slack_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
