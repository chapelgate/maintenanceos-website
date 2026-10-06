# Plan

1. Reuse the existing Security CI dependency environment after `requirements.txt` is installed.
2. Write `resolved-python-packages.txt` from `python -m pip freeze --all`, sorted for stable review.
3. Add that file to the already-existing security evidence artifact.
4. Preserve all existing audit/SBOM/vulnerability-gate steps.
5. Merge only after Chapelgate Estate Gate passes; then require Security CI on main to pass.

Rollback: revert the workflow-only change.