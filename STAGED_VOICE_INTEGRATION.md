# Staged Voice Integration Plan

This plan does not authorise configuration or a call. Realtime stays disabled until
the owner separately approves each external stage.

## Current Official Protocol Basis

- OpenAI server-to-server Realtime uses an authenticated WebSocket at
  `wss://api.openai.com/v1/realtime?model=gpt-realtime-2.1` and supports a stable,
  privacy-preserving `OpenAI-Safety-Identifier` header.
- A Realtime session can use `session.update`, `output_modalities: ["audio"]`, PCMU
  input/output, input transcription with `gpt-live-transcribe`, and VAD.
- Relevant current events include `input_audio_buffer.speech_started`,
  `input_audio_buffer.speech_stopped`,
  `conversation.item.input_audio_transcription.completed`,
  `response.output_audio.delta`, `response.output_audio_transcript.done`, and
  `response.done`.
- Twilio bidirectional Media Streams use `<Connect><Stream>` and WSS. Twilio sends
  `connected`, `start`, `media`, DTMF, `stop`, and bidirectional `mark` messages.
  Audio is base64 `audio/x-mulaw` at 8 kHz; outbound interruption uses `clear`.
- Stream callbacks report `stream-started`, `stream-stopped`, or `stream-error`.
  HTTP callbacks and the WSS handshake must validate `X-Twilio-Signature` against
  the exact public URL Twilio used.

Official references checked 2026-09-07:

- https://developers.openai.com/api/docs/guides/realtime-websocket
- https://developers.openai.com/api/docs/guides/realtime-conversations
- https://developers.openai.com/api/docs/guides/realtime-transcription
- https://developers.openai.com/api/docs/models/gpt-realtime-2.1
- https://developers.openai.com/api/docs/models/gpt-live-transcribe
- https://www.twilio.com/docs/voice/media-streams/websocket-messages
- https://www.twilio.com/docs/voice/twiml/stream
- https://www.twilio.com/docs/usage/security

## External Adapter Boundary

- Realtime AI providers are selected only through the immutable allowlist in `provider_runtime.py`.
  Gemini and OpenAI are the currently supported adapters; unknown values fail closed.
- Phone carriers are selected only through the immutable allowlist in `provider_webhooks.py`.
  Twilio is the only currently supported carrier; unknown values fail before webhook mutation.
- Provider adapters sit outside deterministic MaintenanceOS safety, tenant and lifecycle rules.
  Every supported realtime provider must pass the shared transport, signature, test-number,
  application-secret and isolated-tenant readiness gate before it can be reported ready.
- `ENABLE_PUBLIC_PROVIDER_INGRESS=false` and `ENABLE_REALTIME_VOICE=false` remain the safe defaults.
  Adding an adapter does not authorise provider ingress, change a phone number, or make a call.

## Minimum Approved Sequence

1. Freeze and verify the tested source/evidence; use only the synthetic tenant.
2. Provision a dedicated test deployment, private database, secret store, logging,
   edge limits, TLS HTTPS/WSS hostname, and tested rollback. Do not configure Twilio.
3. Inject test-project OpenAI and Twilio credentials through the secret store; run
   readiness without displaying values. Keep `ENABLE_REALTIME_VOICE=false`.
4. Verify DNS/TLS, health/readiness, external request limits, and provider signature
   fixtures. Confirm the live business number remains untouched.
5. Configure only the dedicated Twilio test number to the signed inbound endpoint
   and status callback. Keep Realtime disabled and test deterministic fallback only
   when separately authorised.
6. Enable Realtime for one supervised window, with AI side effects disabled, a
   staffed human transfer number, synthetic caller/property, and rollback owner.
7. Make one separately authorised controlled call. Observe signature validation,
   connected/start/media/stop ordering, PCMU both ways, transcript timing, identity
   handling, interruption, output gating, call logging, and human fallback.
8. Disable Realtime after the call, preserve evidence, and review every transcript,
   state transition, output, provider event, and failure before any second call.

## Stop Conditions

Immediately disable Realtime and preserve evidence on any safety downgrade, private
disclosure, prohibited financial statement/action, false action confirmation,
missing transcript before audio, unverified signature, tenant mismatch, lost
critical state, uncontrolled retry, or failed human fallback.

## What Still Requires Staged Proof

No local mock proves public TLS/WSS, Twilio-delivered signatures, carrier event
ordering, real PCMU quality, model/project availability, transcription under UK
speech/noise, output transcript timing, DTMF, status callbacks, disconnect recovery,
or human transfer answer/no-answer behavior.
