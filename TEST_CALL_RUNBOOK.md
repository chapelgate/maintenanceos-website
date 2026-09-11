# Controlled Test Call Runbook

This runbook governs future controlled tests; it does not erase or supersede calls
that have already occurred.

## Locally Proven

- Deterministic text classification and monotonic critical-safety state.
- Tenant-bound call sessions and tenant checks on API/tool resources.
- Idempotent incident, model-call, contractor, invoice, evidence, and timer records.
- Critical-state blocks on dispatch, booking, quote, invoice, completion, confirmation, approval, and closure.
- AI side-effect kill switch with human/manual operations preserved.
- Payment/refund/compensation/client-money actions absent from the model tool surface and false confirmations blocked before audio playback.

The exact local evidence is the complete `pytest` suite. A passing synthetic test is
not evidence of carrier, network, audio, transcription, transfer or live Realtime
behaviour.

## Real-call checkpoint

Real receptionist calls have already been made. Their telemetry must be reconciled
before declaring the live-call acceptance state. Until provider evidence is imported,
each live criterion is PASS only when supported by objective evidence, FAIL when an
observed defect establishes failure, and UNKNOWN otherwise.

Known user-observed failures requiring correction and retest:

- Voice/accent quality was unacceptable for the intended UK receptionist experience.
- Emergency wording exposed US-oriented guidance; UK emergency/safety wording must be deterministic.
- Human-transfer behaviour did not provide the intended staffed fallback path.

Do not report "no live call has occurred" merely because provider evidence has not
yet been imported.

## Live evidence to reconcile

- Twilio webhook and WebSocket signatures as delivered through the public ingress.
- Twilio `connected -> start -> media -> stop`, DTMF, stream status callbacks, fallback `<Dial>`, reconnect and final call status.
- OpenAI Realtime WebSocket connection, PCMU audio exchange, transcript timing, output transcript availability, upstream errors and latency.
- UK caller audio involving noise, accents, interruptions and ambiguous safety language.
- Human-transfer destination, answer/no-answer behaviour and operational follow-up delivery.
- Call SID/timestamp/duration mapping so every acceptance decision can point to a specific test call without publishing caller PII.

## Kill Switch

Set the database-backed `AI_SIDE_EFFECTS` runtime control to disabled through the authenticated, tenant-bound internal endpoint. This takes effect on the next model action without deployment. It does not disable manual staff operations. For voice-wide rollback, set `ENABLE_REALTIME_VOICE=false`; inbound voice then returns deterministic fallback TwiML and attempts the configured human transfer.

## Rollback

1. Disable `AI_SIDE_EFFECTS` and confirm the control reads disabled.
2. Disable `ENABLE_REALTIME_VOICE` if the audio bridge itself must stop.
3. Restore the prior webhook only after the active test call has ended.
4. Preserve call, escalation, audit and critical-safety records for review; do not delete or downgrade them.
5. Do not re-enable a failed path until the failure has an incident note and an authorised reviewer agrees to retry.

## Known Limits

- The repository does not currently contain the private provider telemetry needed to grade the calls already made.
- Text fixtures do not validate speech recognition or voice quality.
- SQLite is suitable for isolated tests but production concurrency requires the configured transactional database to be staged under load.
- Evidence reuse detection is exact-fingerprint detection, not forensic image analysis.
- Public ingress rate limiting, central monitoring and managed-database failover require external-environment evidence.
