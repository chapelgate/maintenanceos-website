# LandlordOS (WorkSmartOS sub-category) — Synthetic England ≤10-unit Landlord Vertical Pilot Scorecard

Status: PRE-DRAFT. No unqualified READY. Synthetic data only. No live PII without Andy DPIA/DPA.

Scope: one product reader, `pilot/landlord_vertical.py`. `WORKSMART_VERTICAL=landlordos` then `activate_landlord_vertical()` turns the vertical on. The same process registers at most 10 synthetic properties, runs `evaluate_landlord_compliance()` on stored rows, records a `SYN-HO-*` maintenance handoff, then `deactivate_landlord_vertical()` assigns `WORKSMART_VERTICAL=none` and restores the pilot snapshot taken at activation. mos-06 still owns the identity pin. This slice does not add a second manifest format.

---

## Candidate identity fields

| Field | Value | Evidence |
|---|---|---|
| MOS application SHA | runtime `pilot_status()["worksmart_vertical"]["mos_sha"]` | `git rev-parse HEAD` inside `pilot/landlord_vertical.py` |
| Slice brief base | `adde57eb61feed4758c1153f6277955544a0fcf9` | slice brief |
| Branch | `readiness/lo-ws-08-pilot-synthetic` | `git branch --show-current` |
| Vertical | `landlordos` while the flag is on; `none` after off | `read_worksmart_vertical()` |
| Market scope | `england_synthetic_le_10` when the flag is `landlordos`; `core_mos` otherwise | `vertical_view()` |
| Licence route | NONE | slice brief |
| Landlordos pin | UNKNOWN | mos-06 pin is not invented here |

No secrets recorded.

---

## Scorecard rows

Each row is PASS, FAIL, or UNKNOWN. No unqualified READY.

| # | Flag | Status | Command evidence | Notes |
|---|---|---|---|---|
| 1 | Product reads `WORKSMART_VERTICAL` | PASS | `python3 -m pytest -q tests/test_landlord_vertical_e2e.py tests/test_landlord_vertical_rollback.py` → `6 passed in 1.05s`, exit 0 | `pilot_status()["worksmart_vertical"]` follows the env flag. Active becomes true only after `activate_landlord_vertical()`. |
| 2 | ≤10 synthetic properties | PASS | same command, exit 0 | `open_synthetic_portfolio(units=11)` raises `VerticalPropertyCap` with `requested=11` and `limit=10` and inserts nothing. A later 10-unit open plus one more unit stays at 10 stored rows. |
| 3 | Compliance evaluation | PASS | same command, exit 0 | `evaluate_landlord_compliance()` counts stored `Property` rows and fails a resident email that is not `@example.invalid`. |
| 4 | Maintenance handoff ref | PASS | same command, exit 0 | Passing compliance persists `AuditEvent` `maintenance_handoff` and `get_maintenance_handoff(ref)` returns `SYN-HO-*`. A failing portfolio records no handoff. |
| 5 | Vertical off restores baseline | PASS | `python3 -m pytest -q tests/test_landlord_vertical_rollback.py::test_vertical_off_restores_baseline` → `1 passed in 0.70s`, exit 0 | `deactivate_landlord_vertical()` assigns `WORKSMART_VERTICAL=none`. `calls_completed`, `calls_admitted`, `calls_answered`, `aborted`, and `armed` return to the pre-on snapshot. |
| 6 | `WORKSMART_VERTICAL=none` is enforced on read | PASS | included in the 6 passed | Setting the env to `none` and calling `pilot_status()` restores the snapshot. |
| 7 | Missing landlordos does not crash core MOS | PASS | included in the 6 passed | Unset flag reads as `none`. A synthetic core `Client` insert still commits. `activate_landlord_vertical()` raises `VerticalInactive`. |
| 8 | Existing pilot 10-call guard | PASS | `python3 -m pytest -q tests` → `596 passed`, exit 0 | `tests/test_pilot_runtime_guard.py` remains in that suite. This slice does not retarget the golden line. |
| 9 | Later voice admission after rollback | PASS | `python3 -m pytest -q tests/test_landlord_vertical_rollback.py tests/test_staged_voice_routes.py::test_signed_inbound_route_fails_closed_to_human_fallback` → `4 passed`, exit 0 | Rollback no longer leaves `PILOT_MODE_ARMED=true`. |
| 10 | Synthetic fixtures only | PASS | included in the 6 passed | Markers are `SYNTHETIC`, `example.invalid`, postcode `ZZ1 1ZZ`, phone `+440000000000`. This PASS is not the live-PII gate. |
| 11 | Monitoring cell | UNKNOWN | `pilot_status()` returns scorecard, persistence, and `worksmart_vertical` | No live dashboard is wired. |
| 12 | Onboarding executed | UNKNOWN | `docs/commercial_release/LANDLORD_VERTICAL_ONBOARDING.md` exists | The runbook is written. Live onboarding has not been executed. |
| 13 | Andy live-PII gate | UNKNOWN | docs state no live PII without Andy DPIA/DPA | UNKNOWN until Andy DPIA and DPA. Not auto-PASS. |

No xfail and no xpass. There is no open mos-* import gap in this slice, so no `mos_xfail` marker is applied.

---

## Andy live-PII gate (not auto-PASS)

**No live PII without Andy DPIA/DPA.**

This row stays UNKNOWN until all of the following exist:

1. Andy DPIA approved for live landlord resident or property data.
2. Andy DPA covering any processor for that live data.
3. Written owner sign-off recorded before any live PII is introduced.

Do not mark row 13 PASS from a synthetic fixture run. Row 10 PASS covers synthetic fixtures only.

---

## Command evidence

```text
python3 -m pytest -q tests/test_landlord_vertical_e2e.py tests/test_landlord_vertical_rollback.py
6 passed in 1.05s
exit 0

python3 -m pytest -q tests/test_landlord_vertical_rollback.py::test_vertical_off_restores_baseline
1 passed in 0.70s
exit 0

test -f docs/commercial_release/LANDLORD_VERTICAL_PILOT.md
exit 0

python3 -m pytest -q tests/test_landlord_vertical_rollback.py tests/test_staged_voice_routes.py::test_signed_inbound_route_fails_closed_to_human_fallback
4 passed, 1 warning in 6.69s
exit 0

python3 -m pytest -q tests
596 passed, 16 warnings in 91.86s
exit 0

python3 -m py_compile pilot/landlord_vertical.py pilot/runtime_guard.py tests/test_landlord_vertical_e2e.py tests/test_landlord_vertical_rollback.py
exit 0
```

Council measurement on `26e4b6cd318f4b84c53591a8b56dfb0047636a74` before this fix: `8 failed, 598 passed`, exit 1. The 8 failures were `tests/test_staged_voice_routes.py` after `PILOT_MODE_ARMED` leaked. Those voice tests were not edited. This rewrite replaced 16 false landlord tests with 6 tests, so the suite count is 596 passed and 0 failed.

No project lint or typecheck script is present. `py_compile` is the check that was run.

---

## Rollback

`deactivate_landlord_vertical()` sets `WORKSMART_VERTICAL=none` and restores the pilot snapshot captured by `activate_landlord_vertical()`. A later `pilot_status()` read while the flag is `none` or unset does the same restore when a snapshot is still held. Core MOS still answers `pilot_status()` when the flag is absent. Vertical off does not delete synthetic property rows.

---

## Frozen areas

Not touched: `ir_deadlines/`, `lc/`, `ir_web/legal.py`, matter templates, EW housing, `ir_disclosure/`, `ir_redaction/`, `ir_raster/`, `deploy/**`, `.do/`, `Dockerfile`, `docker-compose`, `.github/`, `.env*`, voice and telephony modules, `call_*`, `awaab_*`, `tenant_security.py`, `identity*`, `security.py`, `cloud-workers-sync/`.

---

## Licence route

NONE. No third-party code, schemas, strings, or tests were copied. The reader is original and uses this repo's `Property`, `TenantBoundary`, `WorkOrder`, `AuditEvent`, and pilot runtime snapshot.

---

**Recorded by:** readiness loop (Andy, 23 Oct 2026) from the LandlordOS (WorkSmartOS sub-category) commercial-readiness council. Draft for landlord owner bot; do not merge without the owner.
