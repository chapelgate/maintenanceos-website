# mos-1028-redactor-import-lock

## Goal
Lock that http_error_text, audit_text, and operational_logging import cleanly and redact a known secret sample, so IndentationError regressions on main fail CI immediately.

## Acceptance
- tests/test_redactor_import_lock.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
