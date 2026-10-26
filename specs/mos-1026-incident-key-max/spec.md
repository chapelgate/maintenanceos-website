# mos-1026-incident-key-max: IncidentIdentity incident_key stays bounded

## Goal
create_from_channel incident_key values are at most INCIDENT_KEY_MAX (200) characters, matching IncidentIdentity.incident_key String(200). Overlong keys fail closed with ValueError before IncidentIdentity rows are written.

## Acceptance
- `tests/test_incident_key_max.py::test_incident_key_max_is_200` passes.
- `tests/test_incident_key_max.py::test_incident_key_accepts_bounded_text` passes.
- `tests/test_incident_key_max.py::test_incident_key_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
