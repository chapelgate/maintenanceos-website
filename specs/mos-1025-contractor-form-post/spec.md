# mos-1025-contractor-form-post: contractor portal forms stay POST with token

## Goal
Contractor decision, availability, and complete HTML forms use CONTRACTOR_FORM_METHOD="post" and include a hidden token field. The matching POST handlers require token=Form(...).

## Acceptance
- `tests/test_contractor_form_post.py::test_contractor_form_method_is_post` passes.
- `tests/test_contractor_form_post.py::test_contractor_forms_include_hidden_token` passes.
- `tests/test_contractor_form_post.py::test_contractor_post_handlers_require_token_form` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
