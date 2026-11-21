# Service Definition — chapelgate-multilingual-transcribe

## Product
chapelgate-multilingual-transcribe — Commercial Product #1 (Welsh/English first, reuses Welsh Build 2 read-only).

## Lot
Cloud Software (SaaS)

## Description
Automatic speech recognition (transcription) service for Welsh/English-first audio, with bench scoring across en/ga/gd/fr/de/es/pl. Used by council-minutes via HTTP API. Local CPU inference only; no paid API.

## Key features
- ASR/transcription of audio using faster-whisper CTranslate2 and transformers engines loaded locally from Hugging Face Hub
- Bench scoring across English, Irish, Scots Gaelic, French, German, Spanish, Polish
- Welsh (cy) supported via Bangor pin (not in FLEURS)
- Local CPU inference only; no paid API; no model training
- Memory, long 10min, silence, and boundary reliability tests
- Bench gate: wer_max 0.25, cer_max 0.12; model selection recorded in results JSON with git_sha and verdict

## Intended users
Councils and public sector bodies needing Welsh/English transcription of audio (e.g. council minutes recordings).

## Data handled
Audio clips (FLEURS synthetic/public test audio; Welsh Bangor pin). No personal data in bench runs. Local CPU inference only.

## AI/ML use
- Models: faster-whisper-large-v3-turbo (MIT), canary-1b-v2 (CC-BY-4.0, selected), parakeet-tdt-0.6b-v3 (CC-BY-4.0)
- Models loaded locally from Hugging Face Hub, not via OmniRoute
- Canary-1b and Parakeet too large for 6g production image limit; not fetched in production image

## Security & compliance
- SBOM: chapelgate-multilingual-transcribe — 399 components, 34 critical, 199 high, 161 medium (REVIEW — requires critical/high remediation)
- Model card: compliance/model-cards/chapelgate-multilingual-transcribe.md
- Cyber Essentials self-check: PARTIAL (not certified)

## Evidence paths
- Source: /home/andy/chapelgate/repos/chapelgate-multilingual-transcribe/
- Model card: jobs-work-dell/readiness/compliance/model-cards/chapelgate-multilingual-transcribe.md
- SBOM: jobs-work-dell/readiness/sbom/chapelgate-multilingual-transcribe/
- Bench results: /home/andy/chapelgate/repos/chapelgate-multilingual-transcribe/bench/results/

## Known gaps
- SBOM has 34 critical / 199 high vulnerabilities requiring remediation (fix via dependency bump or VEX exception)
- Cyber Essentials certification not yet obtained
- Scottish Gaelic not available (no FLEURS split); no audio invented
- Welsh via Bangor pin only

## Version
0.1.0 (pyproject.toml)