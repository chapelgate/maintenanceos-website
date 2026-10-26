# mos-1025-contractor-a11y: contractor portal confirm pages get landmarks

## Goal
Give the contractor decision, availability, and completion HTML pages a document language, a main landmark, an h1, and labelled controls so the synthetic portal is not bare unmarked markup.

## Acceptance
- `tests/test_contractor_portal_a11y.py::test_decision_confirm_has_landmarks_and_labelled_submit` passes.
- `tests/test_contractor_portal_a11y.py::test_availability_form_labels_inputs` passes.
- `tests/test_contractor_portal_a11y.py::test_complete_form_labels_inputs` passes.
- Existing contractor boundary tests still pass.

## Safety boundary
- Licence route: NONE.
- No frozen voice/deploy paths. Contractor portal stays fail-closed unless ENABLE_CONTRACTOR_PORTAL=true.
