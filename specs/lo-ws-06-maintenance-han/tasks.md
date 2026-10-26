# Tasks: LandlordOS Maintenance Handoff Wire

- [x] Implement `build_handoff_payload` with `mos_job_id`, `property_id`, `landlord_state`, `summary` parameters
- [x] Implement `handoff_from_mos_job` accepting dict or object with job id and property id
- [x] Define `ALLOWED_LANDLORD_STATES` frozenset with INTAKE_RECORDED, REFERENCE_SYNCED, AWAITING_MOS, LANDLORD_CLOSED
- [x] Define `SYSTEM_OF_RECORD = "MOS"` constant
- [x] Ensure `system_of_record`, `triage_owner`, `dispatch_owner` are always "MOS"
- [x] Validate landlord_state is within ALLOWED_LANDLORD_STATES
- [x] Ensure landlord states do not change MOS job status
- [x] No voice or telephony imports in the module
- [x] Named acceptance test: `test_payload_includes_mos_job_and_property_ids` passes
- [x] Named acceptance test: `test_mos_remains_system_of_record` passes
- [x] Named acceptance test: `test_no_voice_or_telephony_imports` passes
- [x] No modifications to frozen paths (IR statutory deadline engine, legal-matters, EW housing, disclosure/redaction, production DBs, golden phone line)
- [x] No new service, queue, database, or caller added
- [x] Pure functions only — no side effects