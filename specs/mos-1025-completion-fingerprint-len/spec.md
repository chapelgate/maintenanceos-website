# mos-1025-completion-fingerprint-len: completion fingerprint stays 64 lowercase hex

## Goal
Completion evidence fingerprints are always SHA-256 digests of exactly 64 lowercase hex characters before storage. Any other length or alphabet fails closed.

## Acceptance
- `tests/test_completion_fingerprint_len.py::test_completion_fingerprint_len_is_64` passes.
- `tests/test_completion_fingerprint_len.py::test_completion_fingerprint_is_sha256_hex` passes.
- `tests/test_completion_fingerprint_len.py::test_completion_fingerprint_rejects_non_hex_length` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
