# Feature Specification: Product Profile Selection

## Overview
This feature implements product profile selection for MaintenanceOS / WorkSmart OS by configuration without scanner suppressions. The profile is selected via the `PRODUCT_PROFILE` environment variable. Unset/blank defaults to `maintenanceos`. Unknown values fail closed. Only presentation strings are affected - no commercial runtime booleans are flipped.

## Requirements

### Functional Requirements
1. **Environment Variable**: Read `PRODUCT_PROFILE` environment variable
2. **Allowlisted Profiles**: Only `maintenanceos` and `worksmartos` are valid
3. **Default Behavior**: Blank/unset defaults to `maintenanceos`
4. **Fail Closed**: Unknown values raise `ProductProfileError` and `profile_ready()` returns `False`
5. **Presentation Strings Only**:
   - `api_title()`: "MaintenanceOS V1 Pilot" / "WorkSmart OS"
   - `page_title()`: "MaintenanceOS V1" / "WorkSmart OS"
   - `worker_banner()`: "MaintenanceOS V1 worker running" / "WorkSmart OS worker running"
6. **Overlay Rejection**: Overlay dicts containing retention, voice, telephony, market, dispatch, or credential keys are rejected
7. **No Voice Stack Imports**: `product_profile.py` must not import provider runtime, voice modules, telephony, or Google SDK

### Non-Functional Requirements
- No new services, queues, databases, or heavy dependencies
- Reuse existing code
- No scanner suppressions
- No frozen path modifications

## Acceptance Criteria
- `test_blank_profile_is_maintenanceos` passes
- `test_worksmartos_changes_presentation_only` passes
- `test_unknown_profile_fails_closed` passes
- `test_overlay_is_rejected` passes (parametrized for all six deny keys)
- `test_wiring_uses_profile_helpers` passes
- `test_profile_module_imports_no_voice_stack` passes

## Files to Modify
- `product_profile.py` (new)
- `tests/test_product_profile.py` (new)
- `api.py` - use `api_title()`
- `dashboard.py` - use `page_title()`
- `worker.py` - use `worker_banner()`
- `readiness.py` - use `profile_ready()`