# Implementation Plan: Product Profile Selection

## Approach
Implement a lightweight product profile module that reads `PRODUCT_PROFILE` environment variable and exposes presentation string helpers. The module validates overlays against deny keys and integrates with existing entry points.

## Steps

### 1. Create product_profile.py
- Define `ProductProfileError` exception
- Define `ALLOWED_PROFILES` set with `maintenanceos`, `worksmartos`
- Define `DENY_KEYS` set with `retention`, `voice`, `telephony`, `market`, `dispatch`, `credential`
- Implement `_profile_from_env()` to read and validate env var
- Implement `profile_ready()` returning bool
- Implement `_current_profile()` helper
- Implement `api_title()`, `page_title()`, `worker_banner()` presentation functions
- Implement `validate_overlay()` for deny-key rejection

### 2. Create tests/test_product_profile.py
- `test_blank_profile_is_maintenanceos` - blank env defaults to maintenanceos
- `test_worksmartos_changes_presentation_only` - worksmartos changes only strings
- `test_unknown_profile_fails_closed` - unknown value raises error, profile_ready False
- `test_overlay_is_rejected` - parametrized for all 6 deny keys
- `test_wiring_uses_profile_helpers` - reads api/dashboard/worker/readiness as text
- `test_profile_module_imports_no_voice_stack` - asserts no forbidden imports

### 3. Wire api.py
- Add `from product_profile import api_title`
- Change `FastAPI(title="MaintenanceOS V1 Pilot", ...)` to `FastAPI(title=api_title(), ...)`

### 4. Wire dashboard.py
- Add `from product_profile import page_title`
- Change `st.set_page_config(page_title="MaintenanceOS V1", ...)` to `st.set_page_config(page_title=page_title(), ...)`
- Change `st.title("MaintenanceOS V1 Pilot")` to `st.title(page_title())`

### 5. Wire worker.py
- Add `from product_profile import worker_banner`
- Change `print("MaintenanceOS V1 worker running")` to `print(worker_banner())`

### 5. Wire readiness.py
- Add `from product_profile import profile_ready`
- Add `"product_profile_ready": profile_ready` to `CHECKS` and `"product_profile_ready"` to `LOCAL_CLOSED_KEYS`. Do not return all False from `report()` when the profile is not ready.

### 6. Verify
- Run `python3 -m pytest -q tests/test_product_profile.py` - all pass
- Run full test suite - all pass
- Run gitleaks - no new suppressions

## Dependencies
- No new dependencies
- Reuses existing `os`, `dotenv` (already loaded in entry points)

## Risks
- Low: Only presentation strings change, no runtime behavior changes
- No frozen paths touched
- No voice stack imports in product_profile.py