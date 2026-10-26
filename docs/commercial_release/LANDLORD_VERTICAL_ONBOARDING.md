# LandlordOS (WorkSmartOS sub-category) — Synthetic England ≤10-unit Landlord Vertical Onboarding Runbook

Synthetic-first. Stop conditions. Rollback owner role. **No live PII without Andy DPIA/DPA.**

Status: PRE-DRAFT. No unqualified READY. The Andy live-PII gate is UNKNOWN and is not auto-PASS.

---

## Synthetic-first

The product path is `pilot/landlord_vertical.py`.

1. `WORKSMART_VERTICAL=landlordos`
2. `activate_landlord_vertical()` captures the pilot snapshot and marks the vertical active.
3. `open_synthetic_portfolio(units=10)` writes at most 10 properties. `units=11` raises `VerticalPropertyCap` and writes nothing.
4. `evaluate_landlord_compliance(client_id)` reads stored rows.
5. `record_maintenance_handoff(client_id, description="SYNTHETIC ...")` persists a `SYN-HO-*` ref only when compliance passed.
6. `deactivate_landlord_vertical()` assigns `WORKSMART_VERTICAL=none` and restores the snapshot.

Synthetic markers the evaluator requires:

- address contains `SYNTHETIC` and `NO REAL ADDRESS`
- postcode `ZZ1 1ZZ`
- property type contains `TEST`
- resident name contains `SYNTHETIC`
- resident email ends with `@example.invalid`
- resident phone `+440000000000`
- tenant boundary mode `SYNTHETIC_TEST`

**Stop if live PII appears.** Data that misses those markers fails compliance. Do not continue with live resident or property data.

---

## Stop conditions

| Condition | What enforces it | Action |
|---|---|---|
| Live PII | compliance findings such as `resident_email_not_synthetic` | Stop. Andy DPIA/DPA required before any live data. |
| More than 10 synthetic properties | `VerticalPropertyCap` | Stop the open. Stored count stays at or below 10. |
| Handoff before a passing evaluation | `VerticalComplianceError`; no `maintenance_handoff` audit row | Do not invent a handoff ref. |
| Flag unset, `none`, or not `landlordos` | `read_worksmart_vertical()` returns `none`; activate raises `VerticalInactive` | Core MOS keeps serving. |
| Pilot call 11 while the chapelgate guard is armed | existing `PilotAdmitRejected` | Unchanged golden-line guard. Not a licence to retarget the phone line. |

---

## Rollback

Rollback owner action, in the same process that activated the vertical:

```python
from pilot.landlord_vertical import deactivate_landlord_vertical
deactivate_landlord_vertical()
```

That assigns `WORKSMART_VERTICAL=none`. It does not merely pop the variable. It restores `calls_completed`, `calls_admitted`, scorecard `calls_answered`, `aborted`, and `PILOT_MODE_ARMED` to the values captured at `activate_landlord_vertical()`.

Setting `WORKSMART_VERTICAL=none` in the environment and then calling `pilot_status()` also restores a held snapshot. Unset is read as `none`. The product off path still writes the string `none`.

Vertical off does not delete synthetic property rows. Do not treat those rows as live customers.

Proof:

```bash
python3 -m pytest -q tests/test_landlord_vertical_rollback.py::test_vertical_off_restores_baseline
```

That node must exit 0.

---

## Rollback owner role

Andy, as owner, is the only person who may:

1. Authorise a future move beyond this synthetic pilot.
2. Approve a DPIA and DPA before any live PII.
3. Decide whether an abort that existed before vertical on stays in force. An abort raised only inside the vertical session is rolled back with the snapshot.

Do not mark the Andy live-PII scorecard row PASS from this runbook.

---

## No live PII without Andy DPIA/DPA

Until Andy has approved a DPIA and a DPA, and written sign-off is recorded, this vertical uses synthetic fixtures only.

| Requirement | Status |
|---|---|
| Andy DPIA approved | UNKNOWN |
| Andy DPA signed | UNKNOWN |
| Owner written sign-off for live PII | UNKNOWN |

Row 10 on the scorecard PASSes for synthetic fixtures only. Row 13, the Andy live-PII gate, stays UNKNOWN. Not auto-PASS.

---

## What this runbook does not do

- It does not execute live onboarding. Scorecard row 12 stays UNKNOWN.
- It does not pin landlordos identity. That pin stays UNKNOWN until mos-06. No second manifest format is added.
- It does not change voice, telephony, or the golden phone line.
- It does not call the NVIDIA API.

---

**Recorded by:** readiness loop (Andy, 23 Oct 2026) from the LandlordOS (WorkSmartOS sub-category) commercial-readiness council. Draft for landlord owner bot; do not merge without the owner.
