Estate-Preflight: yes
Estate-Route: FEATURE
Estate-Artifact: specs/mos-1024-03-comp-eval
Estate-Converged: yes

## Summary

`evaluate_compliance()` calls `landlordos.compliance.evaluate_compliance` on an allowlisted synthetic England context (`id`, `postcode`, `property_ref` only) and returns structured facts only. Conclusion and deadline keys, including nested copies, free-text sentences, and date-shaped strings from the dependency are dropped. The caller dict is not mutated. This module does not log.

`vertical_profile.py` is byte-identical to ready draft #196 (`readiness/lo-ws-02-vertical-flag`, blob `2ae0ba10abda8b4ad447046a88e7a16734fe8c0c`), including `OVERLAY_KEYS`. This replaces the thinner mos-1024-02 copy so this PR does not put a selector on main that fails #196's overlay-key test.

Fail-closed readiness helpers from mos-1024-02 remain. `LandlordComplianceError` is still raised when the vertical is not landlord, the dependency is missing, or the result is not a dict.

## Why

The bridge returned the dependency dict unchanged, including a section 21 sentence and a deadline date, with no verified legal rule. The named tests did not reject that shape. Product rule: no legal advice and no automated legal deadline without a verified rule and an approved test.

## Acceptance tests

- `tests/test_landlord_compliance_bridge.py::test_synthetic_england_eval_returns_structured_facts` — PASSED
- `tests/test_landlord_compliance_bridge.py::test_disallowed_fields_are_stripped` — PASSED

`python3 -m pytest -q tests/test_landlord_compliance_bridge.py` — 9 passed in 0.06s

Those two tests failed before the return filter (dependency `conclusion` / `deadline` came back unchanged) and passed after it.

## Suite counts

Before: 590 passed, 0 failed, 16 warnings (`origin/main` `4cbd6f3`, 70.52s)
After: 599 passed, 0 failed, 16 warnings (this branch, 61.67s)

No tests deleted, skipped, or xfailed. No lint or typecheck script in the repo. `python3 -m py_compile` on the touched Python files exited 0.

## Reuse source + licence route + attribution

Licence route: NONE. Clean-room return filter. No copied third-party code.
`vertical_profile.py` reused byte-for-byte from the same estate, ready draft PR #196, ref `readiness/lo-ws-02-vertical-flag`, git blob `2ae0ba10abda8b4ad447046a88e7a16734fe8c0c`. Fail-closed helpers reused from mos-1024-02-comp-off.

## Blast radius

Safety fact: dependency result `{"conclusion": "Serve a section 21 notice", "deadline": "2026-12-01", "compliant": True}` returns `{"compliant": True}`. Outbound call receives only `id`, `postcode`, and `property_ref`. Caller `access_code` stays on the input dict. Proven by the named tests and a direct probe.

`evaluate_compliance` is called only from `landlord_compliance_bridge.py` and `tests/test_landlord_compliance_bridge.py`. #196's five `tests/test_vertical_profile.py` tests passed against this file (5 passed). The blob matches #196, so an add/add merge with #196 is the same content. An add/add merge with unmerged #201 will conflict; keep the #196 bytes.

Whitespace strings and ISO or UK date strings are dropped even under other keys. A non-advice phrase or a date-shaped id can be omitted. A deadline date cannot be returned. No IR deadline engine, lc/, ir_web/legal.py, matter templates, voice or telephony modules, deploy config, or frozen path.

## Frozen-area statement

No frozen paths touched. ir_deadlines/, lc/, ir_web/legal.py, matter templates, voice/telephony, deploy/**, Docker*, .github/, .env* all unchanged. Changed paths are absent from frozen.json for maintenanceos-v1-pilot and _default.

## pstack skills used

poteto-mode (facts dict is the data shape; filter at the boundary). verification-before-completion (suite commands and counts above). blast-radius (return-path probe and #196 overlay tests). no-comments (removed the overstated isinstance comment and test narration; #196 docstrings kept so the selector stays byte-identical).

Created by the readiness loop (Andy, 23 Oct 2026) from the MaintenanceOS / WorkSmart OS commercial-readiness council. Draft for Worksmartos (ed7c7d7d); do not merge without the owner.
