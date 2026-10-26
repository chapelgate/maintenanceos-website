# mos-08-shared-classifier: Both profiles share the deterministic classifier

## Goal
Prove MaintenanceOS and WorkSmart OS both use `decision_engine.classify` and that the profile cannot override safety categories.

## Acceptance
- `tests/test_shared_classifier.py::test_both_profiles_classify_office_door_the_same` passes.
- `tests/test_shared_classifier.py::test_profile_has_no_category_override` passes.
- `tests/test_shared_classifier.py::test_test_file_imports_no_voice_modules` passes.
- `product_profile.py` is presentation only. It does not import the voice stack.

## Safety boundary
- Licence route: NONE.
- No frozen paths and no category fork.
