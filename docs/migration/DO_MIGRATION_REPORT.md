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

## Blocker (identity lifecycle first — no human bootstrap ask yet)

DigitalOcean account credential is **already vaulted** in USH (`DO_USH_DEPLOY`).

**Fixed anti-pattern:** do not persist USH `issue_token()` (TTL 3600s) as permanent `USH_WORKLOAD_TOKEN`.

**Current MOS identity design:** durable Ed25519 workload keypair + auto-refresh via `POST /v1/auth/workload` (`ush_identity.py`). Proven by `tests/test_ush_identity_lifecycle.py` (expiry, restart, revocation, fail-closed).

**STOP:** do not request Andy to enter bootstrap/workload credentials until this lifecycle is accepted and PR #57 review/CI are complete. PR #57 remains draft — **not merged to main**.

See `docs/migration/USH_IDENTITY_LIFECYCLE.md`.


## DigitalOcean N=2 / N=5 / N=10 / N=25

**NOT_RUN** — waiting on MOS principal grant. Adapter + vault already PASS.

## Twilio / Resend

Obtain through USH credential broker after principal grant. No separate retry architecture.

## Render retirement

Deferred until DO readiness + progressive N gates pass. Specs keep Render as rollback URL only.
