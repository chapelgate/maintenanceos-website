# MaintenanceOS Current Status

Date: 2026-09-15

## Authoritative source

This repository, `chapelgate/maintenanceos-v1-pilot`, is the single authoritative MaintenanceOS product repository.

Default branch: `main`.

The historical copy under `chapelgate/cloud-workers/jobs/maintenanceos` is a **deployment/validation copy only**. Canonical product changes belong here first, then must be deliberately synchronised to the deployment copy where Render still deploys from `cloud-workers`. Do not let `cloud-workers` become the product source of truth.

## Verified canonical state

- Canonical `main` includes the Gemini Live provider, provider-aware routing/readiness, UK voice hardening and deterministic safety/lifecycle controls.
- Important historical merge: `1f4ba147124731b46b281878d771fcd9e58ee789`.
- Consequential business actions remain controlled by deterministic MaintenanceOS rules, not by the model.
- Live human Twilio `<Dial>` must occur only on explicit caller request (DTMF 0 or finished transcript phrase match). Technical failures and partial Gemini hypotheses must fail closed.

## Infrastructure map (do not confuse products)

| Product | Host | Notes |
| --- | --- | --- |
| Holiday Let Operator (HLO) | DigitalOcean `chapelgate-hlo-production` `167.99.202.163` | **DO NOT TOUCH** for MaintenanceOS work |
| Evidence Wallet | DigitalOcean `chapelgate-production-wallet` `46.101.16.174` | Unrelated |
| Cheap Trips | DigitalOcean `chapelgate-cheap-trips-production` `206.189.112.98` | Unrelated |
| MaintenanceOS (active) | Render `maintenanceos-redteam-v2` | Lane A pilot — keep until DO acceptance |
| MaintenanceOS (target) | DigitalOcean App Platform `maintenanceos-london` (lon) | **No droplet yet** — see `docs/migration/DO_MIGRATION_REPORT.md` |

A previous debugging path mistook `167.99.202.163` for MaintenanceOS. That assumption is invalid. Do not deploy MaintenanceOS there, modify its routing/database/Caddy, or stop its containers.

## Migration freeze (2026-09-18)

- Feature development and Render-specific repairs frozen during DO migration.
- `n2-secrets-retry` cancelled permanently — do not poll absent Resend / Twilio / DO tokens.
- Resend is email-only and must not block voice/DO bring-up.
- N=2 baseline evidence preserved under `docs/concurrency_100_evidence/`.
- DigitalOcean credentials live in **USH** (`DO_USH_DEPLOY` on `https://68.183.44.222`) — **do not** inject `DIGITALOCEAN_TOKEN` into Cursor.
- MOS→USH identity must be **renewable** (Ed25519 workload key + bearer auto-refresh). Do not store 1h `issue_token` bearers as `USH_WORKLOAD_TOKEN`.
- See `docs/migration/USH_IDENTITY_LIFECYCLE.md`. Do not merge PR #57 until lifecycle tests remain green.
- **STOP:** no human bootstrap ask until identity lifecycle is accepted.


## Current Render runtime (must be re-verified each session)

- Service name: `maintenanceos-redteam-v2`
- Owner-supplied service ID: `srv-dahhskafngtc739pnplg`
- Owner-supplied workspace: `tea-dah7d4h5efls738bode0`
- Public URL: `https://maintenanceos-redteam-v2.onrender.com`
- Deployment repository (legacy path): `chapelgate/cloud-workers` branch `main`
- Render auto-deploy: OFF
- Operator inventory: `python render_inventory.py` (requires `RENDER_API_KEY`; boolean-only; never touches HLO)

### Observed 2026-09-15

- `GET /health` → HTTP 200 `{"ok":true,"version":"v1-pilot","realtime_voice":true}` (re-checked later the same day; still true; `rndr-id` present; origin `uvicorn`)
- That means **ENABLE_REALTIME_VOICE is currently TRUE on the live service**
- Intended CLOSED/PRE-CALL configuration requires `ENABLE_REALTIME_VOICE=false` and `ENABLE_PUBLIC_PROVIDER_INGRESS=false`
- `/readiness` remains HTTP 401 without internal credentials (expected)
- PR #32 is open and must not be merged on CI green alone.
- 2026-09-15 later: Andrew set `ENABLE_REALTIME_VOICE=false` and `ENABLE_PUBLIC_PROVIDER_INGRESS=false` on `maintenanceos-redteam-v2` and chose Manual Deploy → Deploy latest commit. The **new build failed** after `280 passed, 17 warnings`, `SYNTHETIC_VOICE_TENANT_READY`, then `Refusing Twilio webhook configuration: public provider ingress is not ready`. Closed-mode was recognised; the deploy path treated the intentional webhook refusal as fatal. Do not turn the safety flags back on. Canonical fix: `python render_prepare.py` / `python configure_twilio_webhooks.py` skip Twilio mutation in closed mode and exit 0. Live `/health` still showed `realtime_voice: true` after the failed deploy because the previous instance remained running.
- Authorised write routes to Render were exhausted from this agent and are all closed: no `RENDER_API_KEY`; Render API unauthenticated `401`; no Render CLI session; no Render MCP; no `render.yaml` / deploy hook in this repo; GitHub token can see only `chapelgate/maintenanceos-v1-pilot` (not `cloud-workers`); GitHub environments empty; workflows do not set live Render env vars (red-team job is localhost-only). The live `/controls/ai-side-effects` path cannot change `ENABLE_REALTIME_VOICE` (env-only; endpoint is authenticated anyway).
- Exact Render deploy ID / commit SHA / full env remain unread. Do not assume which deployment is current.

## Intended CLOSED / PRE-CALL configuration

```
VOICE_PROVIDER=gemini
VERIFY_TWILIO_SIGNATURES=true
ENABLE_REALTIME_VOICE=false
ENABLE_PUBLIC_PROVIDER_INGRESS=false
ENABLE_CONTRACTOR_PORTAL=false
ENABLE_LIVE_EMAIL=false
ENABLE_LIVE_MESSAGING=false
DEFAULT_AUTO_DISPATCH_LIMIT=0
ALLOW_REMOTE_AI_SIDE_EFFECT_ENABLE=false
PUBLIC_BASE_URL=https://maintenanceos-redteam-v2.onrender.com
PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE=60
PUBLIC_WS_RATE_LIMIT_PER_MINUTE=20
VOICE_TRANSCRIPT_GRACE_SECONDS=1.0
VOICE_TRANSCRIPTION_TIMEOUT_SECONDS=5.0
```

Enable realtime voice + public provider ingress **only** for the controlled-call window after `public-test-config` readiness passes. Disable them again afterwards unless Andrew authorises continued live operation.

To close an accidentally open window after `RENDER_API_KEY` is available: `python render_inventory.py --apply-closed-flags`. That sets only the two call-window flags to false on the MaintenanceOS Render service and redeploys. It refuses HLO and unrelated services.

## Fixed ten-step tracker

Use only PASS or OPEN. Do not invent another checklist.

1. PASS — Source of truth reconciled (canonical repo identified; `cloud-workers` is deployment copy only).
2. PASS — Cloud CI baseline established (historical; re-confirm on current `main` as needed).
3. OPEN — Observed live-call defects have code fixes but need fresh carrier evidence.
4. PASS — Historical provider evidence recovered.
5. OPEN — Historical call acceptance evidence improved but incomplete.
6. PASS — Transfer/UK regression hardening completed (code + tests); Gemini now also gates Dial on `finished` transcription.
7. OPEN — Actual runtime/persistence evidence is not yet sufficient for final controlled-call approval.
8. OPEN — Current external environment/readiness evidence must be re-established on the actual runtime via Render API.
9. OPEN — Fresh controlled carrier retest.
10. OPEN — Final release decision.

## Immediate mission

Get MaintenanceOS demonstrably ready for Andrew to make **one** controlled real Twilio test call.

Do **not** declare `READY FOR CONTROLLED TEST CALL` from unit tests, `/health`, or historical Twilio evidence alone. Prove the complete current pre-call configuration first.

## Concurrency / call-centre scale (isolated branch)

Branch: `cursor/n2-live-concurrency-e283` (updates PR #41 / `cursor/concurrency-100-scale-d1b9`).
Reconciled with `main` @ `9e03f15` (Render keepalive/warm). **Not merged to production path yet.**

| Gate | Status |
| --- | --- |
| Simulated ladder 1→5→12→25→50→75→100 | **PASS** (leases + DB isolation + **100 mock AI contexts**; not live media) |
| HTTP telephony-path probe 1→5→12 | **PASS** (signed `/voice/inbound`, no carrier spend) |
| Regression suite | **PASS** locally (307 passed after main reconcile) |
| Concurrency red-team | **PASS** |
| Independent defender (re-executes ladder) | **PASS** (`DEFENDER_PASS_SIMULATED`) |
| GitHub Actions on PR | **PASS** — Cloud CI + Security CI green on `8d6fa94` / evidence commit `d075483` |
| Controlled deploy tooling | **READY** — `scripts/controlled_n2_deploy.py` (MOS-only; rollback file; kill-switch env) |
| Deploy credential | **BLOCKED** — `RENDER_API_KEY` absent in this agent; `cloud-workers` GitHub 404 |
| Smallest real concurrency probe | **OPEN** — owner-authorised **N=2** after controlled-call deploy — never 100 chargeable |
| Next bottleneck class | Twilio / Gemini-or-OpenAI realtime **provider quotas** |

Evidence: `docs/concurrency_100_evidence/` / `scripts/build_concurrency_evidence_pack.py`.

Design: `docs/CONCURRENCY_100_SCALE.md` (includes 250/500/1000 scaling seams without provisioning spend).

Rollback point: `origin/main` baseline `9e03f15c5baaecdc266800b241244e61855defcc` (`scripts/verify_rollback_point.sh`).

Deploy: inject `RENDER_API_KEY` into this Cloud Agent, then the agent runs `--apply` on `maintenanceos-redteam-v2` only.

## Agent rule

All MaintenanceOS agents must begin from this repository and this status file. Do not treat chat memory, the old `cloud-workers/jobs/maintenanceos` directory, a historical Droplet name, or an unverified deployment as the source of truth. Never touch HLO.
