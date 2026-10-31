# MaintenanceOS V1 Pilot

This repository is the **single authoritative MaintenanceOS product source**.

MaintenanceOS is a multi-tenant maintenance-operations system with deterministic server rules owning safety, lifecycle, tenant isolation, approvals and financial prohibitions. AI may collect and classify information, but it does not have authority to override safety or perform consequential actions.

## Voice architecture

Gemini Live is the primary configured realtime receptionist provider through `VOICE_PROVIDER=gemini`. OpenAI Realtime remains an optional fallback/legacy provider. Realtime providers are selected through an explicit allowlisted adapter contract in `provider_runtime.py`; phone-carrier configuration is separately allowlisted through `PHONE_PROVIDER` in `provider_webhooks.py` (currently Twilio only). Both adapter boundaries sit outside the deterministic MaintenanceOS safety/lifecycle core and fail closed for unknown providers.

The production container starts `asgi:app`. That entrypoint reuses the hardened FastAPI application in `api.py` and switches only the realtime voice transport through `provider_runtime.py`.

The receptionist uses UK terminology and 999 emergency guidance, collects caller details, supports explicit human transfer, and must not invent bookings, dispatches, refunds, compensation, account information or safety assurances.

## Implemented product controls

- Tenant-scoped properties, residents, contractors, work orders, links, exports, jobs, communications, action evidence and call sessions.
- Central lifecycle transitions, critical-safety latching, human clearance, audit events, escalation queues, approvals, contractor operations, quote/invoice checks, completion and reopening.
- Deterministic emergency detection and downstream safety control.
- Voice transcript/session recording primitives, Twilio HTTP/WSS signature verification and isolated voice-tenant controls.
- Provider-aware Gemini/OpenAI realtime voice runtime with fail-closed handling.
- Durable retries, idempotency, dead-letter escalation and schema readiness checks.
- Streamlit supervisor dashboard, FastAPI application, worker, cloud CI, security CI and production container validation.
- No payment, refund, compensation, fee-waiver or client-money execution authority.

## Cloud evidence

Real receptionist calls have occurred and provider-side Twilio evidence has been recovered in sanitized form. The historical cloud validation lane proved Gemini credential presence, 255 passing tests, synthetic voice tenant readiness, Twilio webhook readiness and Render red-team success. Some human-transfer attempts completed and some produced no-answer outcomes.

A fresh controlled Gemini test-number call is still required before production declaration to prove real Gemini WSS/media streaming, voice quality, transcript capture, interruption handling and transfer/no-answer behaviour on the consolidated source.

## Source-of-truth rule

The historical `chapelgate/cloud-workers/jobs/maintenanceos` directory is a legacy cloud-validation copy. Product development belongs in this repository. Shared cloud infrastructure may remain in `cloud-workers`, but agents must not develop competing MaintenanceOS product copies there.

See [CURRENT_STATUS.md](CURRENT_STATUS.md) first for the live checkpoint, then [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY_DEPLOYMENT.md](SECURITY_DEPLOYMENT.md), [DATA_GOVERNANCE.md](DATA_GOVERNANCE.md), [STAGED_VOICE_INTEGRATION.md](STAGED_VOICE_INTEGRATION.md), and [TEST_CALL_RUNBOOK.md](TEST_CALL_RUNBOOK.md).

