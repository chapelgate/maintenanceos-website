# mos-1024-03-comp-eval: Synthetic landlord compliance eval and strip

## Goal

With vertical=landlord and landlordos importable, call `evaluate_compliance` on an allowlisted synthetic England context and return structured facts only. Strip disallowed fields (special_category, contact_dump, access_code, etc.) before eval and logs. Not legal advice. No automated legal deadlines.

## Acceptance

- `evaluate_compliance(raw_input)` returns a structured facts `dict` when called on a synthetic England context (ids, postcode, property_ref only).
- Disallowed fields (`special_category`, `contact_dump`, `access_code`, `ssn`, `medical_record`, `full_name`, `date_of_birth`, and any other key) are stripped from the outbound call. The caller dict is not mutated. This module does not log.
- A dependency dict is not returned unchanged. `conclusion`, `deadline`, nested copies of those keys, free-text sentence values, and date-shaped strings are removed. Bools, numbers, and identifier tokens such as `compliant`, `checks`, and `ok` are kept. The bridge does not invent a legal conclusion or a deadline date.
- The function raises `LandlordComplianceError` when not in landlord vertical, when `landlordos.compliance` is unavailable, or when the dependency result is not a dict.
- Named tests in `tests/test_landlord_compliance_bridge.py` pass:
  - `test_synthetic_england_eval_returns_structured_facts`
  - `test_disallowed_fields_are_stripped`
- Fail-closed helpers from mos-1024-02 stay in place. `vertical_profile.py` is byte-identical to ready draft #196 (`readiness/lo-ws-02-vertical-flag`), including `OVERLAY_KEYS`. This slice does not publish the thinner mos-1024-02 selector.

## Safety boundary

- Licence route: NONE. Clean-room. No copied third-party code. `vertical_profile.py` is reused from the same estate's ready draft #196.
- No voice, telephony, genai, or apscheduler import.
- No frozen path edits. No NVIDIA runtime call.
- Rollback: delete `landlord_compliance_bridge.py`, `vertical_profile.py`, `tests/test_landlord_compliance_bridge.py`, and `specs/mos-1024-03-comp-eval/`.
