# MaintenanceOS: comparing the live DB schema with main, and a migration plan

Date: 2026-10-10 (BST). Author: Grok Bot (executor). Status: PLAN ONLY. No migration has been run and nothing has been written to the live DB.

## How the comparison was done
- Live DB: the SQLite file at `/var/lib/maintenanceos/maintenanceos.db`, which is the DATABASE_URL target on droplet 601962983. I reached it via `ssh mos-gemini`, opened it with `sqlite3` URI `mode=ro` and read only `sqlite_master`, `PRAGMA table_info` and `PRAGMA index_list/index_info`. I read no row data and made no writes. The temporary script and output in /tmp were removed afterwards.
- Main: `models.Base.metadata.create_all()` run against a throwaway SQLite file on the box, at main b3c165e. models.py has not changed since then: PRs #152 and #153 don't touch it. The result was read with the same script.
- Raw outputs: `/workspace/livesync/live_schema.json` and `/workspace/livesync/main_schema.json`.

## Result
- Shared tables: every table that exists on live exists in main with **identical columns, types, NOT NULL flags, primary keys and unique constraints/indexes**. That includes `action_receipts` (client_id, scope, action_key), which is already scoped, so `migrate_schema.migrate_action_receipts` would do nothing.
- Live-only tables: none.
- **Tables only in main (3):**
  - `awaab_cases`: Awaab's Law case tracking. Used by awaab_policy.py and awaab_runtime.py.
  - `data_lifecycle_holds`: data-retention holds. Used by data_lifecycle.py.
  - `data_lifecycle_requests`: data-subject requests. Used by data_lifecycle.py.
- In main, `schema_health.REQUIRED_TABLES` lists all three. So against today's live DB, main's `/readiness` `schema_compatible` would report **false** until they exist.

## Why this counts as a migration
Deploying main would create these tables with nothing else involved: `ExecStartPre=render_prepare.py` calls `seed_synthetic_tenant.ensure_synthetic_tenant()`, which calls `models.init_db()`, which runs `Base.metadata.create_all()`, and `api.py` also calls `init_db()` when it is imported. That is a purely additive DDL change: three CREATE TABLE statements plus their indexes. Existing tables and data are not altered. It is still a schema change to the production DB. Under the deploy rule ("no DB migration is needed, if one is, stop and report"), **deploy is stopped until Andy decides.**

## Proposed plan (for Andy to approve; NOT run)
1. Preconditions: reconciliation PRs merged, Cloud CI green on main, and the post-call (call_notifications) decision made.
2. Stop window: `systemctl stop maintenanceos` (the voice line is down for under a minute).
3. Back up: `sqlite3 /var/lib/maintenanceos/maintenanceos.db ".backup /var/lib/maintenanceos/maintenanceos.pre-<sha>.db"` (or cp while stopped), then check the sha256 and run `PRAGMA integrity_check` on the copy.
4. Apply: deploy the new app. `render_prepare` / `init_db` will CREATE the three tables. Optionally run the equivalent explicit step first, as the `maintenanceos` user: `python -c "import models; models.init_db()"`.
5. Verify: `python -c "from schema_health import schema_report; print(schema_report())"` should give `schema_compatible: true`. Confirm the existing row counts haven't changed (counts only). `/health` should return 200.
6. Rollback: stop the service, restore the app folder from backup, then either leave the three new empty tables in place (old code ignores them, so this is harmless) or copy the pre-migration DB back if there is any doubt. Restoring the DB file throws away any calls logged after the cutover, so dropping the empty tables is preferred.
7. Ownership: the DB file is owned by `maintenanceos:maintenanceos`. Any manual step must run as that user, not root, so the new pages and journal files keep the right owner.

## Other observations (no action taken)
- There is a stray empty file `/var/lib/maintenanceos/maintenanceos.db\r` (root-owned, 0 bytes, 28 Sep). It looks like it came from an env file with CRLF line endings at some point. It's harmless; delete it only with Andy's OK.
- There is also an `/opt/maintenanceos/app/maintenanceos_v1.db` (28 Sep), which is NOT the DB in use. It should be excluded from any app-folder rollback copy decisions.
- Every service start runs `render_prepare.py`, which resets `ai_side_effects` to False on both live and main. **Main's render_prepare also calls `configure_phone_voice_webhook()`, which can update the Twilio voice webhook through the Twilio API on every start. Live's version does not do this.** That is an external side effect a deploy of main would bring in, separate from the DB question, and it should be reviewed (or confirmed fail-closed/no-op for the current env) before any deploy.
