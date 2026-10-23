# Tasks

- [x] Parse direct requirements from `requirements.txt` including extras.
- [x] Read version + licence via `importlib.metadata`.
- [x] Write JSON register with `METADATA`/`UNKNOWN` status.
- [x] Acceptance test: every direct requirement has a row.
- [x] Acceptance test: UNKNOWN rows don't invent a licence.
- [x] Acceptance test: register has no secret fields.
- [x] Full suite: 590 passed (base 587 + 3 new tests).
- [x] Regenerate matches committed JSON.
- [x] Gitleaks clean.
- [x] Estate Gate passes with spec artifact.
