# Live → main drift reconciliation ledger (#147)

Date: 2026-10-10 (BST). Live snapshot: /opt/maintenanceos/app on droplet 601962983, taken read-only. Compared against origin/main b3c165e. Method: for each drifted file, find the repo commit whose blob equals the live file (CRLF-normalised), then diff merge-base→live (LIVE-SIDE) and merge-base→main (MAIN-SIDE). "No live-side change" means the live file is an ancestor version of main's file, so main already contains everything live has.

| File | Live version = commit | Live-side changes not in main | Status |
|---|---|---|---|
| voice_bridge.py | 6ef7227 | reconnect / soft-recovery / latency logging | PR #152 |
| api.py, call_capacity.py | 6ef7227 | stale call-slot cleanup, VOICE_PENDING_LEASE_TIMEOUT_SECONDS | PR #153 |
| email_gateway.py | 64874bc | none | main is a superset (+54/-6 main-only) |
| provider_runtime.py | 65bf576 | none | main is a superset (+38/-18) |
| provider_webhooks.py | 65bf576 | none | main is a superset (+40/-2) |
| readiness.py | 65bf576 | none | main is a superset (+24) |
| render_prepare.py | 65bf576 | none | main is a superset (+5/-5). The startup Twilio webhook call is made opt-in by PR #155 |
| schema_health.py | 65bf576 | none | main is a superset (+2; requires the 3 new tables, see the migration plan) |
| ush_client.py, ush_identity.py | 0de90f5 | none | main is a superset (+1/-1 each) |
| voice_policy.py | 65bf576 | none | main is a superset (+5/-2) |
| worker.py | 65bf576 | none | main is a superset (+12) |
| models.py | 65bf576 | none | main is a superset (+50: awaab_cases, data_lifecycle_*). Needs the migration decision |
| gemini_voice.py | 76fdd82 (base 8b98afe) | **no functions or event codes are missing**. Every live function, including the response watchdog, 600 ms VAD and the stall reprompt, is in main via #151. Only the prompt wording differs; main's is stricter: full read-back with "Is all of that correct?", the PHONE PRIVACY and CORRECTION rules, and the gas/CO rule | main is a functional superset. Deploying it changes prompt wording to main's stricter version |
| call_notifications.py, post_call_extractor.py | 76fdd82 / 09e0992 | live structured extractor and cg58 reconcile | **HOLD**: waiting on Andy's post-call email design choice (main's rebuilt verified-facts report vs live; see PR #149) |

Live-only, non-runtime: docs/migration/ISSUE_67_* evidence files and scripts/issue67_staging_voice_evidence.py (all on commit 6ef7227), plus `*.pre-*` backup copies in the app folder. None of them are needed for runtime parity.
