# mos-1025-contractor-link-ttl: contractor portal link TTL stays bounded

## Goal
Contractor portal links use CONTRACTOR_LINK_TTL_SECONDS only when it is an integer from 300 to 604800 inclusive. Missing, non-integer, and out-of-range values use 86400. sign_link's default expiry path is unchanged, so voice_stream tokens are not retargeted.

## Acceptance
- `tests/test_contractor_link_ttl.py::test_contractor_link_ttl_bounds` passes.
- `tests/test_contractor_link_ttl.py::test_contractor_link_ttl_accepts_inclusive_range` passes.
- `tests/test_contractor_link_ttl.py::test_contractor_link_ttl_out_of_range_uses_one_day` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false. voice_bridge.py is not edited.
