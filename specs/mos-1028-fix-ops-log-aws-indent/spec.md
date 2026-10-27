# mos-1028-fix-ops-log-aws-indent

## Goal
Restore correct indentation of AWS_SECRET_KEY.sub inside operational_logging._redact after #492 left it outside the str branch (IndentationError).

## Acceptance
- operational_logging imports
- generic/ops/aws redaction pytest modules pass
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
