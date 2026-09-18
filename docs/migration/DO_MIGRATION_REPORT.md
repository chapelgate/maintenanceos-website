# DigitalOcean migration report (USH architecture)

**Generated:** 2026-09-18T19:05:00Z  
**Branch:** `cursor/do-migration-reconcile-e283`  
**Mode:** STOP secret-retry / USH DigitalOcean broker

## Cancelled obsolete machinery

- `n2-secrets-retry` — **cancelled permanently** (do not resubscribe; do not poll absent secrets)
- Cursor Cloud Agent `DIGITALOCEAN_TOKEN` inject — **forbidden**; DO credentials belong in USH vault
- EE / overnight feature timers — frozen during migration

## Target architecture

| Layer | System |
| --- | --- |
| Source of truth | GitHub (`maintenanceos-v1-pilot`) |
| Runtime | DigitalOcean (App Platform `maintenanceos-london`, lon) |
| Credential broker | USH (`chapelgate/chapelgate-universal-secrets-handler.`) @ `https://68.183.44.222` |
| External providers | Twilio / Gemini / OpenAI / Resend via USH |
| Render | Legacy validation / rollback only — **not** an active secret-resolution path for DO |

## USH DigitalOcean adapter (live evidence)

```text
GET https://68.183.44.222/health
→ digitalocean.registered=true
→ adapter_class=live_http
→ profile=DO_USH_DEPLOY
```

OpenAPI snapshot: `docs/migration/USH_OPENAPI_SNAPSHOT.json`  
Contract contribution: `contrib/ush-digitalocean-adapter/`  
MOS client: `ush_client.py` (operations/credentials via workload identity)

**DO account credential is already vaulted in USH.** Re-asking Andy for a DigitalOcean token is forbidden.

## CURRENT active runtime (Lane A — untouched until DO acceptance)

| Field | Value |
| --- | --- |
| Service | `maintenanceos-redteam-v2` |
| URL | https://maintenanceos-redteam-v2.onrender.com |
| Deploy SHA | `054b92b2ed28d9c6ab9dfd6ca66c142778537cec` |
| Voice | OpenAI realtime; Resend absent (email-only; not required for voice) |

## Blocker (not DO token bootstrap)

Exhausted autonomous identity routes on 2026-09-18 (see `USH_IDENTITY_EXHAUSTION.json`):

- Live USH `https://68.183.44.222` healthy; DigitalOcean adapter vaulted (`DO_USH_DEPLOY`)
- `POST /v1/principals/register` → `401 bootstrap_admin_required` for all principal kinds
- All capability/operation APIs → `401 authentication_required` without workload bearer
- Render / GitHub Actions / IMDS / self-hosted workers: no USH identity material
- SSH to live USH: **publickey only** (DO welcome root passwords rejected / unusable)
- Second chapelgate-ush-1 IP from DO mail unreachable
- USH git repo not required — live API is authority

**ONE human-only action:** add Cursor Cloud Agent secret `USH_BOOTSTRAP_TOKEN` (preferred) or `USH_WORKLOAD_TOKEN` for principal `maintenanceos-v1-pilot` at
https://cursor.com/dashboard/cloud-agents/environments/e/69e354a8-aed0-11f1-bf4b-42ffb4d10ea7

Source from USH admin on `chapelgate-ush-1` (Estate bootstrap). Do **not** paste into chat/Git/PR. Do **not** add `DIGITALOCEAN_TOKEN`.

After inject, run `python3 scripts/ush_establish_mos_identity.py` then continue DO provision + N=2.


## DigitalOcean N=2 / N=5 / N=10 / N=25

**NOT_RUN** — waiting on MOS principal grant. Adapter + vault already PASS.

## Twilio / Resend

Obtain through USH credential broker after principal grant. No separate retry architecture.

## Render retirement

Deferred until DO readiness + progressive N gates pass. Specs keep Render as rollback URL only.
