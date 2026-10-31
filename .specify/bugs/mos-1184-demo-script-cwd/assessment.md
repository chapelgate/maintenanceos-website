# Assessment — mos-1184-demo-script-cwd

## Symptom
`tests/test_landlord_demo_script.py` failed: hardcoded absolute cwd, then `sqlite3.OperationalError: no such table: runtime_controls` when running `demo_landlord_pilot.py`.

## Root cause
1. Test used a fixed readiness-loop mirror path that does not exist on this host.
2. Demo script called `activate_landlord_vertical()` without creating schema tables.

## Scope
Repo-relative cwd for the test; call `models.init_db()` before the demo cycle. No voice, deploy, or live data.
