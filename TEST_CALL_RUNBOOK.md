# Controlled Test Call Runbook

This runbook does not authorise external configuration or a telephone call.

## Locally Proven

- Deterministic text classification and monotonic critical-safety state.
- Tenant-bound call sessions and tenant checks on API/tool resources.
- Idempotent incident, model-call, contractor, invoice, evidence, and timer records.
- Critical-state blocks on dispatch, booking, quote, invoice, completion, confirmation, approval, and closure.
- AI side-effect kill switch with human/manual operations preserved.
- Payment/refund/compensation/client-money actions absent from the model tool surface and false confirmations blocked before audio playback.

The exact local evidence is the complete `pytest` suite. A passing local test is not evidence of carrier, network, audio, transcription, or live Realtime behavior.

## Staged Or Live Proof Required

- Twilio webhook and WebSocket signatures as delivered through the selected public ingress.
- Twilio `connected -> start -> media -> stop`, DTMF, stream status callbacks, fallback `<Dial>`, and reconnect behavior over the real carrier path.
- OpenAI Realtime WebSocket connection, PCMU audio exchange, transcript timing, output transcript availability, and upstream failure behavior.
- UK caller audio involving noise, accents, interruptions, and ambiguous safety language.
- Human transfer answer/no-answer behavior and operational follow-up delivery.

## Kill Switch

Set the database-backed `AI_SIDE_EFFECTS` runtime control to disabled through the authenticated, tenant-bound internal endpoint. This takes effect on the next model action without deployment. It does not disable manual staff operations. For voice-wide rollback, set `ENABLE_REALTIME_VOICE=false`; inbound voice then returns deterministic fallback TwiML and attempts the configured human transfer.

## Rollback

1. Disable `AI_SIDE_EFFECTS` and confirm the control reads disabled.
2. Disable `ENABLE_REALTIME_VOICE` if the audio bridge itself must stop.
3. Restore the prior test webhook only after the active test call has ended.
4. Preserve call, escalation, audit, and critical-safety records for review; do not delete or downgrade them.
5. Do not re-enable until the failed staged test has an incident note and an authorised reviewer agrees to retry.

## Known Limits

- No live Twilio/OpenAI call has passed yet.
- Text fixtures do not validate speech recognition quality.
- SQLite is suitable for the isolated local test but production concurrency requires the configured transactional database to be staged under load.
- Evidence reuse detection is exact-fingerprint detection, not forensic image analysis.
- Public ingress rate limiting, central monitoring, and managed-database failover are
  test-environment requirements, not locally proven controls.
- This runbook cannot authorise configuration or a call; those are separate owner
  approval boundaries.
