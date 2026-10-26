# Plan

1. Delete `_SUPPORTED_ENGLAND_MIXED_BORDER_UNITS` (no full-postcode replacement list).
2. Parse outward district; accept only listed CH and SY England districts.
3. Reject every other CH/SY district (including CH4, CH5–CH8, SY5, SY10, SY15–SY25).
4. Add `AL` to `_ENGLAND_AREAS`; keep TD rejected.
5. Keep null-id isolation and ≤10 landlord vertical cap.
6. Acceptance tests including Wallasey CH45 accept and Welsh CH4 reject.

Rollback: revert `landlord_context_adapter.py`, its tests, and this spec folder.
