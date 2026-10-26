# mos-1025-provider-ref-max: delivery provider_reference stays bounded

## Goal
record_delivery_status provider_reference values are stripped and at most PROVIDER_REFERENCE_MAX (200) characters, matching CommunicationDelivery.provider_reference String(200). Overlong references fail closed by returning False before status is updated.

## Acceptance
- `tests/test_provider_ref_max.py::test_provider_reference_max_is_200` passes.
- `tests/test_provider_ref_max.py::test_provider_reference_accepts_bounded_text` passes.
- `tests/test_provider_ref_max.py::test_provider_reference_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
