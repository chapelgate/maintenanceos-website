# mos-1025-signed-link-kinds: signed links stay on the existing kind set

## Goal
sign_link accepts only accept, decline, availability, complete, and voice_stream. Any other kind raises ValueError, and verify_link returns false. voice_stream with a string subject still round-trips. voice_bridge.py is not edited.

## Acceptance
- `tests/test_signed_link_kinds.py::test_signed_link_kinds_are_the_existing_set` passes.
- `tests/test_signed_link_kinds.py::test_existing_kinds_still_round_trip` passes.
- `tests/test_signed_link_kinds.py::test_unknown_link_kind_fails_closed` passes.
- `tests/test_security_stdlib.py` still passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false. The golden line and voice_bridge.py are not edited.
