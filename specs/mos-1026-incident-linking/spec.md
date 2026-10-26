# mos-1026-incident-linking: health incident link surface

## Goal
Expose a bounded incident_link object on GET /health for observability correlation, restore HEALTH_TOP_LEVEL_KEYS / HEALTH_CALL_CAPACITY_KEYS allowlisting (dropped during rebase), and include incident_link in the allowlist.

## Acceptance
- `tests/test_incident_linking.py` passes.
- `tests/test_health_allowlist.py` passes with incident_link allowlisted.
- Health body keys equal HEALTH_TOP_LEVEL_KEYS; call_capacity keys equal HEALTH_CALL_CAPACITY_KEYS.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
