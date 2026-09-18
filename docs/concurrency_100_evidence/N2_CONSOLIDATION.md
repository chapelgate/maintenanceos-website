# N=2 consolidation (updated 2026-09-18T15:25Z)

## Open PR overlap (relevant set)

| PR | Branch | Base | Decision |
|----|--------|------|----------|
| #32 | controlled-call-readiness-3402 | main | **LIVE CANDIDATE** (~120 files) — Lane A tip @ `054b92b` |
| #42 | n2-live-concurrency-e283 | main | Consolidation + dual-call probe + evidence — **this branch** |
| #41 | concurrency-100-scale-d1b9 | main | Superseded by #42 lineage; do not merge separately |
| #52/#53 | chatgpt gemini/latency | live tip | **DO NOT MERGE** — conflicts with proven P0 latency/close |
| #39 | email-latency-live-fix | main | Superseded by live email fail-safe (#55 path) |
| #45 | master-programme | main | Docs/EE only — not Lane A runtime |
| #36 | mos-voice-do-london | main | CONFLICTING alternate host — not used for this N=2 |

## Candidate SHA

- Lane A tip: `054b92b` (Actions dual-call probe + live merge)
- Evidence tip on #42: includes probe hardening (secrets-file load, distinct call refs, completed-leg check)

## Automated test

- Full pytest on candidate: **327 passed** (re-run 2026-09-18T15:20Z)
- Simulated concurrency ladder 1→100: **PASS**
- Telephony-path HTTP probe: see telephony-path-probe.json

## Live N=2 status

**FAIL** — credentials human gate:

- Cloud Agent secrets: OpenAI only (`CHAPELGATE_OPENAI_KEY`, `OPENAI_API_KEY`)
- GitHub Actions `TWILIO_*`: empty (run 35358556550 gated skip)
- `RENDER_API_KEY`: absent (sibling inject agent confirmed)
- Browser console login: blocked on Google OAuth **password** for `chaplegate@gmail.com` (no Chrome saved passwords)
- Account SID known from Twilio email (`AC7578…3612`) but **Auth Token not recoverable** without console/API key inject
- Live `/health`: armed, `global_limit=2`, calls 3/10, `email_gate` live; `/pilot/synthetic-email-proof` still **404** (tip undeployed)

## Resume path

1. Inject secrets into Cursor env `e/69e354a8-aed0-11f1-bf4b-42ffb4d10ea7` **or** write `/tmp/n2-live-secrets.env`
2. Optional: Manual Deploy Lane A tip on `maintenanceos-redteam-v2`
3. `python3 scripts/n2_live_dual_call_probe.py` until `pass: true` with `overlap_active_ge_2` + distinct call refs
4. Then progressive live N=5/10/25

Workflow: `.github/workflows/n2-live-dual-call.yml`
