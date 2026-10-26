# Plan

1. Keep the existing `requirements.lock` pins that were installed from the current `requirements.txt` ranges.
2. Keep `tests/test_import_boundary.py` parsing those ranges without a packaging library.
3. Add this Spec Kit artifact so Estate Gate can see the FEATURE route is converged.
4. Do not edit `requirements.txt`, application runtime, or frozen paths.

Rollback: delete `requirements.lock`, `tests/test_import_boundary.py`, and `specs/mos-02-import-lock/`.
