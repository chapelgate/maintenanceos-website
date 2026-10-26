# Plan: LandlordOS Maintenance Handoff Wire

## Pure Functions

### `build_handoff_payload`
Build a handoff payload dict from explicit keyword arguments.
- No side effects
- No database access
- No service calls
- No queue interaction
- Pure computation from inputs

### `handoff_from_mos_job`
Extract `mos_job_id` and `property_id` from a MOS job dict/object and delegate to `build_handoff_payload`.
- Works with both `dict` and ORM object inputs
- Extracts `id` / `work_order_id` / `mos_job_id` as the job identifier
- Extracts `property_id` from the job
- Delegates payload construction to `build_handoff_payload`

## No New Infrastructure
- No new service
- No new queue
- No new database table
- No new caller / integration path
- Existing `landlord_maintenance_bridge` module is the only consumer

## Existing Primitives Reused
- `ALLOWED_LANDLORD_STATES` from `landlord_maintenance_bridge`
- `SYSTEM_OF_RECORD = "MOS"` from `landlord_maintenance_bridge`
- `_positive_int` validator from `landlord_maintenance_bridge`