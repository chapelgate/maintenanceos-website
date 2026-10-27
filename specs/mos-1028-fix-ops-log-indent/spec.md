# mos-1028-fix-ops-log-indent

## Goal
Restore correct indentation in operational_logging._redact after #489 left GITHUB_OAUTH/USER/SESSION, NPM, and XOXE substitutions outside the `if isinstance(value, str)` block.

## Acceptance
- operational_logging imports cleanly
- tests/test_generic_secret_token_redact.py and sibling ops redaction tests pass
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
