# mos-1027-ops-resident-comment-max

## Goal
Fail closed when resident_confirmation receives a comment longer than RESIDENT_COMMENT_MAX (4000), returning False before opening a session.

## Acceptance
tests/test_ops_resident_comment_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.
