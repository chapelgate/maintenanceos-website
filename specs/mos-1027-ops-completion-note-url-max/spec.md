# mos-1027-ops-completion-note-url-max

## Goal
Fail closed when submit_completion receives a blank/overlong note or overlong evidence_url, returning None before opening a session.

## Acceptance
tests/test_ops_completion_note_url_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.
