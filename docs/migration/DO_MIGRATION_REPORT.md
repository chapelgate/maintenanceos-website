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

USH principal registration for MOS now requires admin bootstrap (`bootstrap_admin_required`).  
This agent has no `USH_WORKLOAD_TOKEN`, so brokered DO ops fail closed without a secret-retry loop.

**Human action (secure, no paste into chat/Cursor/Git):**

1. Add `github.com/chapelgate/chapelgate-universal-secrets-handler.` to Cloud Agent environment  
   https://cursor.com/dashboard/cloud-agents/environments/e/69e354a8-aed0-11f1-bf4b-42ffb4d10ea7  
2. On USH admin path, register principal `maintenanceos-v1-pilot` (`kind=application`, `project=maintenanceos`, `environment=london`, `tenant=chapelgate`) with explicit policy for DigitalOcean `apps.*`  
3. Deliver only `USH_WORKLOAD_TOKEN` into the MOS secure secrets store (not DO token)

## DigitalOcean N=2 / N=5 / N=10 / N=25

**NOT_RUN** — waiting on MOS principal grant. Adapter + vault already PASS.

## Twilio / Resend

Obtain through USH credential broker after principal grant. No separate retry architecture.

## Render retirement

Deferred until DO readiness + progressive N gates pass. Specs keep Render as rollback URL only.
