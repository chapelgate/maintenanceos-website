# mos-1025-evidence-url-https: completion evidence_url stays empty or https

## Goal
Optional contractor completion evidence_url is either blank or a stripped https URL with a host, no userinfo, and no fragment. javascript/data/file/http schemes and overlong values fail closed with HTTP 400.

## Acceptance
- `tests/test_evidence_url_https.py::test_evidence_url_max_is_2000` passes.
- `tests/test_evidence_url_https.py::test_evidence_url_accepts_blank_and_https` passes.
- `tests/test_evidence_url_https.py::test_evidence_url_rejects_unsafe_schemes` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
