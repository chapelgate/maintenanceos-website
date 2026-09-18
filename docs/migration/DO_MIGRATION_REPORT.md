# DigitalOcean migration report (Architecture Reconciliation)

**Generated:** 2026-09-18T18:30:00Z  
**Branch:** `cursor/do-migration-reconcile-e283`  
**Mode:** ARCHITECTURE RECONCILIATION / MIGRATION

## Cancelled obsolete machinery

- Unsubscribed `n2-secrets-retry` (600s Resend/Twilio poll) — **do not resubscribe**
- Unsubscribed `p0-deploy-watch` (Render Resend Call-3 loop)
- Unsubscribed EE cycle / overnight / evolution timers (feature freeze during migration)

## CURRENT active runtime (Lane A — do not alter)

| Field | Value |
| --- | --- |
| Service | `maintenanceos-redteam-v2` (`srv-dahhskafngtc739pnplg`) |
| URL | https://maintenanceos-redteam-v2.onrender.com |
| Deploy SHA | `054b92b2ed28d9c6ab9dfd6ca66c142778537cec` |
| Branch on Render | `cursor/controlled-call-readiness-3402` |
| Region / plan | Frankfurt / free |
| Auto-deploy | OFF |
| Voice | `VOICE_PROVIDER=openai`, `ENABLE_REALTIME_VOICE=true` |
| Ingress | `ENABLE_PUBLIC_PROVIDER_INGRESS=false` (Twilio public route closed) |
| Signatures | `VERIFY_TWILIO_SIGNATURES=false` |
| Concurrency | global=2, per_client=2 |
| Pilot | armed, calls_completed=3, bootstrap_floor=3, sqlite+file_mirror |
| Twilio number | `+441514535238` (SID present; **auth token absent on Render**) |
| Resend | absent (email-only; **not required for voice**) |
| Gemini | absent (OpenAI voice path active) |

Machine-readable inventory: `docs/migration/LANE_A_INVENTORY.json`

## N=2 voice baseline preserved

- Evidence: `docs/concurrency_100_evidence/n2-live-evidence-report.json`
- Programme status: INTEGRATION (owner dual-call attested historically)
- Live PSTN dual-call on this agent session: blocked on Twilio auth/From — **not re-run for missing Resend**
- Simulated concurrency ladder remains PASS in evidence pack

## NEW DigitalOcean runtime

| Field | Value |
| --- | --- |
| Intended platform | DigitalOcean App Platform, region `lon` |
| Spec | `.do/app.yaml` (`maintenanceos-london`) |
| Provisioner | `scripts/provision_do_voice_app.py` (secrets via `secrets_handler.py`) |
| Droplet path | `scripts/provision_do_voice_droplet.py` (only if `PUBLIC_HOST` set) |
| Existing MOS droplet | **None** (reconciled — do not assume stale IDs) |
| HLO / Wallet / Cheap Trips | Untouched |

## DigitalOcean N=2 result

**NOT_RUN** — blocked on missing `DIGITALOCEAN_TOKEN` (cannot create/list App Platform apps).

## Resend status

- Required for realtime voice: **no** (async post-call email only)
- Present in Cursor / Render / mail / transcripts: **no**
- Blocks DO voice migration: **no**
- Human action for email proof: optional, separate from this migration

## Twilio route before / after

| | Value |
| --- | --- |
| Before | Still on Render Lane A (ingress currently false) |
| After | **unchanged** until DO health + synthetic + N=2 gates pass |
| Cutover | Reversible webhook flip only after DO acceptance; Render kept as rollback |

## Rollback path

1. Keep Render `maintenanceos-redteam-v2` live and untouched during DO bring-up
2. On DO failure: leave Twilio pointed at Render (or re-point if cutover started)
3. Do not delete Render until post-cutover verification window completes

## Render retirement

**NO** — Render remains active runtime and rollback. Retirement deferred until DO passes acceptance.

## Single genuine human-only blocker

**HUMAN BLOCKER: DIGITALOCEAN_TOKEN genuinely absent**

Exact action: Create a DigitalOcean personal access token (read/write Apps) for the Chapelgate team → add Cloud Agent secret `DIGITALOCEAN_TOKEN`.

Also required before live DO N=2 (not for App create with closed ingress if using synthetic-only): `TWILIO_AUTH_TOKEN` (+ distinct `TWILIO_FROM_NUMBER` for dual-leg probe). OpenAI key is already present for Lane A parity voice.

After inject: run `python3 scripts/do_migration_preflight.py` then `MOS_LANE_A_PARITY=1 python3 scripts/provision_do_voice_app.py` (Twilio route still unchanged).
