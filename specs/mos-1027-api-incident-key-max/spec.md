# mos-1027-api-incident-key-max

## Goal
Fail closed at the create_work_order API when incident_key is not text or exceeds INCIDENT_LINK_KEY_MAX (200), before create_from_channel runs.

## Acceptance
- create_work_order bounds optional incident_key with _bounded_text(..., maximum=INCIDENT_LINK_KEY_MAX)
- tests/test_api_incident_key_max.py passes
- blank incident_key stays omitted (None)

## Out of scope
channels.py (frozen), voice, deploy, secrets.
