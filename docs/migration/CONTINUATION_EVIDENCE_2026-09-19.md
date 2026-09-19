# Continuation evidence — PR #57 → deploy → concurrency gates

**Generated:** 2026-09-19T11:30:00Z  
**Agent tip (this branch):** see git HEAD  
**Merged identity SHA on `main`:** `c3f53dc20c4e97aa3858f895d593fbc21cf5e1c3`

## 1. PR #57

| Field | Evidence |
| --- | --- |
| Status | **MERGED** 2026-09-19T11:17:36Z |
| Merge commit | `c3f53dc20c4e97aa3858f895d593fbc21cf5e1c3` |
| Pre-merge tip | `4393cf39b982c37823d8bc53bd7a360caf48b036` |
| CI | Cloud CI + Security CI **PASS** (cryptography>=50.0.1 cleared 7 pip-audit CVEs) |

## 2. Deployed version (Lane A — existing estate path)

| Field | Evidence |
| --- | --- |
| Service | `maintenanceos-redteam-v2` (`srv-dahhskafngtc739pnplg`) |
| Branch pointer | `main` |
| Live deploy | `dep-dan70r3tqb8s73arh4b0` **live** |
| Commit | `c3f53dc20c4e97aa3858f895d593fbc21cf5e1c3` |
| Mode | **Closed** (`ENABLE_REALTIME_VOICE=false`, `ENABLE_PUBLIC_PROVIDER_INGRESS=false`) |
| Health | `ok=true`, `realtime_voice=false`, capacity `global_limit=100` |
| Inbound POST | HTTP **503** `Public provider ingress is disabled` (expected in closed mode) |

### Open-window deploy attempt (failed — root cause)

| Field | Evidence |
| --- | --- |
| Deploy | `dep-dan6vmrtqb8s73arcstg` **update_failed** |
| Build | succeeded |
| Fail reason | `nonZeroExit:1` at runtime |
| Root cause | Opening ingress runs `render_prepare` → Twilio webhook mutation; **`TWILIO_AUTH_TOKEN` absent** on Render → `ProviderWebhookError` → process exit 1 |
| Regression | `controlled_n2_deploy.apply_deploy` now refuses open-window when `TWILIO_AUTH_TOKEN` absent |

## 3. Identity architecture (live USH)

| Check | Result |
| --- | --- |
| USH `/health` | PASS — DO adapter `live_http` / `DO_USH_DEPLOY` |
| Durable Ed25519 + ephemeral cache design | Merged on `main`; unit/integration tests PASS |
| Live `POST /v1/auth/workload` | Requires JSON **`workload_token`** (platform/IMDS). Empty/missing → `400 workload_token_required` |
| Live `POST /v1/principals/register` | `401 bootstrap_admin_required` without admin bootstrap |
| MOS adaptation | Resume-first renewal + platform `workload_token` path + Ed25519 fallback (tests) |
| `USH_BOOTSTRAP_TOKEN` in agent | **ABSENT** |
| DO provision via USH | **BLOCKED** on principal grant |

## 4. Tests

| Suite | Result |
| --- | --- |
| Full pytest (pre-merge hardening) | **350 passed** |
| Identity lifecycle + USH client (post resume/platform) | **19 passed** |
| Concurrency ladder + red team | **14 passed** (simulated; not live PSTN) |

## 5–9. Live concurrency gates

| Gate | Status | Evidence |
| --- | --- | --- |
| N=2 live | **NOT_RUN / BLOCKED** | `TWILIO_AUTH_TOKEN` absent on Render + agent; Actions Twilio secrets empty (run 35362358679); voice window closed |
| N=5 live | **NOT_RUN** | gated on N=2 |
| N=10 live | **NOT_RUN** | gated on N=5 |
| N=25 live | **NOT_RUN** | gated on N=10 |
| Simulated ladder (historic pack) | PASS up to 100 simulated | `docs/concurrency_100_evidence/` — **not** a live PSTN claim |

## 10. 100-call readiness

**100_BLOCKED** — engineering limit: live progressive PSTN gates not started; immediate blockers are `TWILIO_AUTH_TOKEN` (open voice + dual-call probe) and `USH_BOOTSTRAP_TOKEN` / platform workload token (DO provision via estate USH). Simulated admission to 100 previously passed; provider quota / Twilio concurrency / DO sizing unproven live.

## 11. Twilio application error

**NOT ELIMINATED (live).** Closed ingress returns controlled 503, not Twilio’s “application error” TwiML path. Open-window boot cannot complete without `TWILIO_AUTH_TOKEN`, so the full Twilio→webhook→AI path was **not** re-verified after `c3f53dc`.

## 12. Estate Harness

No Estate Front Door / Evolution Engine harness is reachable from this agent (no self-hosted workers; USH SSH denied; no robot-labour). MOS local `acceptance_harness.py` is product-local, not estate orchestration. **Estate integration: NOT VERIFIED.**

## 13. Remaining blockers (Andrew)

1. **`USH_BOOTSTRAP_TOKEN`** (preferred) into Cloud Agent env `e/69e354a8-aed0-11f1-bf4b-42ffb4d10ea7` — from USH admin on `chapelgate-ush-1`. Do **not** add `DIGITALOCEAN_TOKEN`.
2. **`TWILIO_AUTH_TOKEN`** onto Render `maintenanceos-redteam-v2` (and Actions secrets if dual-call workflow is used).
3. After (2): open call window + redeploy; run live N=2→5→10→25.

## 14. Explicit non-claims

- No fabricated live N=2/5/10/25 PASS
- No claim that Ed25519 alone exchanges against today’s live USH without platform `workload_token` or bootstrap+resume
- Render remains Lane A validation runtime; DO App Platform still blocked on USH principal
