# MaintenanceOS Current Status

Date: 2026-09-11

## Authoritative source

This repository, `chapelgate/maintenanceos-v1-pilot`, is the single authoritative MaintenanceOS product repository.

The historical copy under `chapelgate/cloud-workers/jobs/maintenanceos` is a cloud-validation legacy copy only. After this consolidation is merged and proven, no new product development should be made against that legacy directory. Shared cloud infrastructure may remain in `cloud-workers`, but product source belongs here.

## Current architecture

- Hardened FastAPI application and deterministic safety/lifecycle controls remain in the existing product code.
- `asgi.py` is the production entrypoint and delegates the existing application unchanged while selecting the realtime voice provider.
- `provider_runtime.py` selects `gemini` or the retained `openai` fallback and fails closed for unknown providers.
- `gemini_voice.py` provides the Gemini Live Twilio media adapter while reusing existing MaintenanceOS session, tenant, Twilio-signature, transcript and fail-closed primitives.
- Gemini is the primary configured voice provider. OpenAI remains optional fallback/legacy support.
- Consequential business actions remain controlled by deterministic MaintenanceOS rules, not by the model.

## Cloud evidence already recovered

The prior cloud validation lane proved Gemini credential availability, 255 passing tests, synthetic voice tenant readiness, Twilio webhook readiness and Render red-team success. A sanitized read-only Twilio probe confirmed the configured test number is in the account, the HTTPS POST voice webhook targets `/voice/inbound`, the transfer number is distinct, and recent provider call/transfer records exist without committing phone numbers, credentials or raw call SIDs.

## Remaining external gates

1. A dedicated isolated managed pilot database/backup path is still required. Render free service capacity is currently exhausted; unrelated Evidence Wallet storage must not be reused.
2. A fresh controlled Gemini test-number call is still required for real WSS/media-stream, voice/accent, transcript, interruption and transfer/no-answer evidence.
3. Production declaration remains prohibited until the consolidated repository passes cloud CI/security/container gates and the controlled provider evidence is recorded.

## Agent rule

All MaintenanceOS agents must begin from this repository and this status file. Do not treat chat memory, the old `cloud-workers/jobs/maintenanceos` directory, or an unverified deployment as the source of truth.
