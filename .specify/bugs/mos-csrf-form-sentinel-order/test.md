# test
Acceptance:
- test_safety_case_cannot_use_contractor_accept_link -> 409
- test_duplicate_contractor_accept_is_rejected -> accept then 409
- availability overlong start/end -> 400
- test_mos_1058_csrf_protection full file green (missing 422, invalid 403, valid 200)

Evidence (2026-10-31):
```
python3 -m pytest tests/test_api_boundaries.py::test_safety_case_cannot_use_contractor_accept_link tests/test_api_boundaries.py::test_duplicate_contractor_accept_is_rejected tests/test_availability_datetime_max.py::test_availability_submit_rejects_overlong_start tests/test_availability_datetime_max.py::test_availability_submit_rejects_overlong_end tests/test_mos_1058_csrf_protection.py tests/test_contractor_form_post.py -q
17 passed
```
Verdict: verified
