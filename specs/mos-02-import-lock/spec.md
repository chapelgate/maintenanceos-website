# mos-02-import-lock: Lock current Python ranges so test imports collect

## Goal
Pin the packages already allowed by `requirements.txt` so `google.genai` and `apscheduler` import, and so every direct pin stays inside its existing range.

## Acceptance
- `requirements.lock` lists pinned `name==version` lines, including transitive imports, with no secrets and no narrative comments.
- `requirements.txt` is unchanged. No floor is raised and no ceiling is widened.
- No new package and no NVIDIA package is added.
- `tests/test_import_boundary.py::test_genai_imports` imports `google.genai`.
- `tests/test_import_boundary.py::test_scheduler_imports` imports `apscheduler`.
- `tests/test_import_boundary.py::test_direct_pins_satisfy_requirements_txt` checks each direct pin against the simple `>=lower,<upper` lines in `requirements.txt`.

## Safety boundary
- Licence route: NONE. A lock of already-declared dependencies.
- No frozen paths, no `.github/`, Docker, `.env`, deploy configs, `provider_runtime.py`, or voice modules.
