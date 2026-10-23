# mos-05-licence-register: Direct Dependency Licence Register

## Goal
Record every direct requirement from `requirements.txt` in a factual register using only installed package metadata. Missing metadata stays `UNKNOWN`. This slice does not choose the product's outbound licence.

## Acceptance
- `scripts/direct_dependency_register.py` reads `requirements.txt` and emits `docs/commercial_release/DIRECT_DEPENDENCY_REGISTER.json` with one row per direct requirement: `requirement`, `version`, `status`, `licence_expression`.
- `status` is `METADATA` when `importlib.metadata` provides a licence; otherwise `UNKNOWN`.
- When `status` is `UNKNOWN`, `licence_expression` is empty (no invented licences).
- JSON contains no secret-like field names.
- Tests in `tests/test_direct_dependency_register.py` pass.

## Safety boundary
- Only reads installed metadata; no network, no third-party source/licence copying.
- Licence route: NONE. No product outbound licence added.
- `requirements.txt` untouched.
