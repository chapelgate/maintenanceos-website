# Specification: LandlordOS Maintenance Handoff Wire

## Overview
Wire landlordos maintenance handoff payload builders to existing MOS job + property id shapes. MOS remains system of record for triage/dispatch. No telephony.

## Payload Contract

### `build_handoff_payload`
**Parameters:**
- `mos_job_id` (positive int) — MOS work order ID
- `property_id` (positive int) — Property ID
- `landlord_state` (str, default "REFERENCE_SYNCED") — Must be in `ALLOWED_LANDLORD_STATES`
- `summary` (str, default "") — Free-text summary

**Returns:** dict with keys:
- `mos_job_id` (int)
- `property_id` (int)
- `landlord_state` (str) — One of `ALLOWED_LANDLORD_STATES`
- `system_of_record` (str) — Always "MOS"
- `triage_owner` (str) — Always "MOS"
- `dispatch_owner` (str) — Always "MOS"
- `summary` (str)

### `handoff_from_mos_job`
**Parameters:**
- `job` — Either a dict with `id`/`work_order_id`/`mos_job_id` and `property_id`, or an object with `.id`/`.work_order_id` and `.property_id` attributes
- `landlord_state` (str, default "REFERENCE_SYNCED")
- `summary` (str, default "")

**Returns:** Same payload dict as `build_handoff_payload`

## System of Record
- MOS is the sole system of record for triage and dispatch
- `system_of_record`, `triage_owner`, `dispatch_owner` are always "MOS"
- Landlord states (`ALLOWED_LANDLORD_STATES`) are separate from MOS execution states and do not mutate MOS job status

## Allowed Landlord States
```python
ALLOWED_LANDLORD_STATES = frozenset({
    "INTAKE_RECORDED",
    "REFERENCE_SYNCED",
    "AWAITING_MOS",
    "LANDLORD_CLOSED",
})
```

## Constraints
- No voice or telephony imports (no `voice`, `telephony`, `twilio`, `channels`, `provider_webhooks`)
- Pure functions only — no new service, queue, database, or caller
- No modifications to frozen paths (IR statutory deadline engine, legal-matters, EW housing, disclosure/redaction, production DBs, golden phone line)