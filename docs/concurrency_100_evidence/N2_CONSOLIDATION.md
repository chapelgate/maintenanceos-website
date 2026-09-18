# N=2 consolidation (2026-09-18T14:48:43Z)

## Open PR overlap (relevant set)

| PR | Branch | Base | Decision |
|----|--------|------|----------|
| #32 | controlled-call-readiness-3402 | main | **LIVE CANDIDATE** (120 files) — already deployed Lane A |
| #42 | n2-live-concurrency-e283 | main | Merged #32 tip into this branch (consolidation) |
| #41 | concurrency-100-scale-d1b9 | main | Superseded by #42 lineage; do not merge separately |
| #52/#53 | chatgpt gemini/latency | live | **DO NOT MERGE** — conflicts with proven P0 latency/close on live |
| #39 | email-latency-live-fix | main | Superseded by live email fail-safe (#55 path) |
| #45 | master-programme | main | Docs/EE only — not Lane A runtime |
| #36 | mos-voice-do-london | main | CONFLICTING; alternate host — not used for this N=2 |

## Candidate SHA

Merged tip on `cursor/n2-live-concurrency-e283` includes live `a3b1add` + consolidation merge.

## Automated test

- Full pytest on live candidate: **327 passed**
- Simulated concurrency ladder 1→100: **PASS** (admission/DB/mock AI only)
- Telephony-path HTTP probe: see telephony-path-probe.json

## Live N=2

Requires Twilio From≠To + Actions/agent secrets. Workflow: `.github/workflows/n2-live-dual-call.yml`.
Cloud Agent `CLOUD_AGENT_ALL_SECRET_NAMES` currently only has OpenAI keys — Twilio/Render requested via environment setup actions.
