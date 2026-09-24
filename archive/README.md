# ARCHIVE — HISTORICAL VOICE WORK — RESEARCH ONLY

## Mandatory agent rule

Everything listed here is HISTORICAL / ARCHIVED.

DO NOT deploy it. DO NOT merge it into the active voice path. DO NOT use it as source of truth. DO NOT select it automatically.

Archived material may be opened only for research, regression comparison, evidence recovery, or extracting a specific proven fix. Any extracted change must be independently reviewed against the current authoritative candidate.

## Current authority

Production/business baseline: main.

Authoritative isolated lifelike candidate:
- PR #77
- branch cursor/local-realtime-voice-383e
- observed head b72230876d26df6ee5fa87d1f170d5e2f0217dde
- candidate source SHA a621924f20fb0f88a23bb883b207683f70db38eb

Approved later enhancements:
- Kokoro-82M
- CG-VOICE-0004 / bf_alice
- speed 0.93 / lang_code b
- Speaches / faster-whisper
- Silero VAD
- Smart Turn v3.2
- streaming cancellation / barge-in

Later sovereign/commissioning branches are evidence/component sources only until explicitly promoted. They are NOT production authority.

## Historical / superseded paths — research only

- PR #2 / fix-voice-stop-finalization-20260910
- PR #21 / fix-live-receptionist-uk-voice-safety-transfer
- PR #23 / consolidate-gemini-source-of-truth-20260911
- PR #36 / cursor/mos-voice-do-london-b4c8 as a voice implementation source
- PR #52 / chatgpt/gemini-38-live-latency
- PR #53 / chatgpt/pilot-voice-latency-close
- PR #69 / cursor/alleygates-voice-rebuild-d235
- PR #70 / fix/pilot-turn-based-voice-20260919
- PR #72 / recovery/twilio-turn-no-api-credit

Merged historical fixes already represented by main must be read from main, not redeployed from old branches:
PR #20, #24, #40, #54, #63, #64, #65, #75, #76.

## Sovereign lineage handling

PRs #78, #79, #83 and #85 contain later commissioning/research work. They are not useless: they contain proven enhancements and evidence. But they are NON-AUTHORITATIVE as complete deployable systems.

Agents may extract only specifically verified components/evidence. Do not deploy those branches wholesale or treat green artifacts as production proof.

Known warning: commissioning evidence has included optimistic/hard-coded auth success and workflows that tolerated failures. Production readiness requires real black-box evidence.

## Never select automatically

- Gemini experimental voice branches
- OpenAI experimental voice paths
- CosyVoice outputs: quarantined
- MiniCPM duplex: compute-blocked
- any historical branch merely because its timestamp is newer

## Cleanup rule

Do not delete archived branches until:
1. final candidate passes full acceptance;
2. unique useful fixes/evidence are reconciled;
3. rollback evidence is preserved;
4. no workflow/deployment/script/document still references the branch as active;
5. deletion is separately proven safe.

Until then: preserve, isolate, research-only.

## Agent preflight

Before changing MaintenanceOS voice:
1. Read this file.
2. Read Issue #88.
3. Confirm work targets the current authoritative lineage.
4. If a proposed source is listed as historical, do not use it as implementation authority.
5. If it contains something useful, extract only the smallest proven change and revalidate it.
