# Plan

1. Parse direct distribution names from `requirements.txt` (include extras like `uvicorn[standard]`).
2. For each name, read `importlib.metadata` version and license classifier.
3. If not installed or no licence, write `status: UNKNOWN`, empty `licence_expression`.
4. Write `docs/commercial_release/DIRECT_DEPENDENCY_REGISTER.json`.
5. Add acceptance tests: every requirement has a row; UNKNOWN rows don't invent a licence; no secret fields.

Rollback: remove the three new files.
