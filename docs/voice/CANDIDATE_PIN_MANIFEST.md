# MaintenanceOS Voice — Candidate Pin Manifest

Status: ACTIVE COMMISSIONING PIN
Purpose: prevent accidental model, voice, engine, or configuration substitution during tuning.

## Authoritative candidate identity

- Voice ID: CG-VOICE-0004
- Version: CG-VOICE-0004-v1
- Speaker: bf_alice
- Display: Bright female
- TTS model: kokoro-82m
- TTS engine: Kokoro
- Speed: 0.93
- Language code: b
- Default: true
- Do not replace/reselect during commissioning without explicit evidence and owner approval.

## Runtime pins

Kokoro image:
ghcr.io/remsky/kokoro-fastapi-cpu:v0.9.0@sha256:7f9a256919eff7a84e9a77b757de0f3fe95c48fcf4fbe1e008deacbc7d9f2985

ASR:
- Speaches
- model: Systran/faster-whisper-tiny.en
- expected local endpoint: 127.0.0.1:8091

TTS expected local endpoint:
- Kokoro: 127.0.0.1:8880

Silero VAD:
sha256:1a153a22f4509e292a94e67d6f9b85e8deb25b4988682b7e174c65279d8788e3

Smart Turn v3.2 CPU ONNX:
sha256:2bb026316b14a660486a75b1733cd3fbab8c2fd0314dc9af7be49f8cca967e4f

## Required properties

- local/self-hosted inference
- no mandatory paid voice API
- no mandatory paid AI inference
- no GPU requirement for current candidate
- streaming TTS
- barge-in/cancellation enabled
- production phone remains isolated during commissioning

## Prohibited automatic substitutions

Do not silently replace any pinned component with:
- Gemini voice
- OpenAI voice/realtime
- CosyVoice
- MiniCPM-o
- another Kokoro speaker
- another ASR model
- another VAD/turn model
- an unpinned container/image/model version

A proposed substitution is a new candidate and requires explicit benchmark, licence/security review, regression testing, and commissioning evidence before promotion.

## Known caveat

Speaches/faster-whisper-tiny.en has produced imperfect transcription in existing evidence. That is a measured quality gap to investigate, NOT permission to silently change ASR.

## Source evidence

Derived from the existing sovereign candidate evidence:
- HUMAN_ENGINE_PRESERVE.json
- HUMAN_ENGINE_MEASURE.json
- VOICE_LIBRARY_INVENTORY.json
- REAL_ONNX_INFERENCE.json
- SPECTRE_HUMAN_ENGINE.json

This manifest freezes configuration for comparison during commissioning. It is not final production acceptance.
