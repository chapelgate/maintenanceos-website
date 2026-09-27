# Agent Factory Step 9 — Phone and External Adapters

**Status:** VERIFIED — ready to freeze/save  
**Scope:** bind the reviewed integration intents from the Step-8 provisioning record to server-side provider connectors, prove those connectors are ready, and advance lifecycle from `provisioning` to `ready`.

## Baselines

- Parent frozen Step-8 checkpoint: `5a7d097924ac004fb08f488ee5b5c5b28f8bbf23`.
- MaintenanceOS compatibility baseline: `5eb0f92f2633e20e4d280835d3e6577e3f206c8b` (latest source rechecked 2026-09-27).
- Current MaintenanceOS telephony ingress already uses Twilio endpoints `/voice/inbound`, `/voice/stream-status`, `/voice/media-stream`, and `/messaging/inbound` with Twilio request-signature validation.
- Live MaintenanceOS phone runtime is a separate workstream and is not changed by this step.

## Acceptance contract

1. Integration intent must exist in the AgentBlueprint **before** customer review/sandbox/provisioning.
2. Current voice-agent templates declare reviewed `telephony` intent; booking assistants also declare reviewed `calendar` intent.
3. Operational connector references stay server-side in readiness evidence. They are not injected into a reviewed blueprint after review.
4. Connector assignments must match the reviewed enabled integration kinds exactly; missing or extra kinds fail closed.
5. Step 9 reuses the authenticated, tenant-scoped Step-8 provisioning gateway. No parallel control plane is created.
6. Browser/model code receives no provider credential values and cannot call the internal adapter route through CORS.
7. Telephony/SMS provider is Twilio. No other carrier-specific implementation is in this step.
8. Twilio readiness inspects the existing IncomingPhoneNumber routing before any change.
9. If a Twilio Voice Application/trunk owns voice routing, or a Messaging Application owns SMS routing, the direct webhook path fails closed because the number-level URL would be ignored.
10. Matching Twilio routes pass without mutation.
11. Provider mutation is disabled by default and requires **both** server `ADAPTER_MUTATIONS_ENABLED=true` and an authenticated signed request with `mode:"apply"`.
12. `mode:"verify"` can never mutate provider state, even when the server mutation flag is enabled.
13. If mutation is explicitly enabled, only the reviewed routing fields are updated: `VoiceUrl`, `VoiceMethod`, `SmsUrl`, `SmsMethod`; the adapter immediately re-reads the number and must verify the final state.
14. Calendar readiness reuses the existing calendar companion and requires an enabled live Google or Microsoft provider with configured OAuth token; mock calendar never qualifies.
15. Email/CRM use a provider-neutral signed-HTTPS readiness contract. Connector secrets remain server-side env values.
16. Readiness is immutable per provisioning ID: replaying the same binding plan returns the stored result; changing bindings after readiness returns conflict instead of silently rewiring providers.
17. Readiness evidence is durable across gateway restart.
18. Successful readiness changes lifecycle only from `provisioning` to `ready`. Step 10 owns `ready` to `active`.

## Twilio grounding

Implementation follows current Twilio platform behavior:

- IncomingPhoneNumber `voice_url` receives incoming calls, but is not used when a `voice_application_sid` or `trunk_sid` owns the route.
- IncomingPhoneNumber `sms_url` receives incoming SMS, but is ignored when an `sms_application_sid` owns the route.
- Twilio signs webhook requests with `X-Twilio-Signature`; MaintenanceOS already validates those signatures on its public provider ingress.
- HTTPS is required for all Step-9 public/provider endpoints.

Primary sources:
- Twilio IncomingPhoneNumber resource: https://www.twilio.com/docs/phone-numbers/api/incomingphonenumber-resource
- Twilio secure webhooks: https://www.twilio.com/docs/usage/webhooks/webhooks-security

## Implementation

- `src/lib/agent-selection.ts`: declares reviewed integration intent at draft creation.
- `packages/provisioning-gateway/src/adapters/registry.ts`: strict server-side connector registry; metadata/env-variable names only.
- `packages/provisioning-gateway/src/adapters/twilio.ts`: inspect/verify and explicitly gated update/re-verify for current MaintenanceOS Twilio endpoints.
- `packages/provisioning-gateway/src/adapters/external.ts`: existing calendar-companion readiness plus signed-HTTPS email/CRM health challenge.
- `packages/provisioning-gateway/src/adapters/engine.ts`: exact binding enforcement, tenant scope, lifecycle-only readiness transition.
- `packages/provisioning-gateway/src/server.ts`: authenticated `POST /v1/provisioning/adapters/prepare` route using the existing Step-8 HMAC/nonce boundary.
- `packages/provisioning-gateway/src/store.ts`: durable readiness record keyed by provisioning ID.
- `.env.example`: server-only registry/mutation flags; no `NEXT_PUBLIC_*` equivalent.

## Verification state

- Exact pre-closure engineering candidate: `2ce3027824e1ece05be760e5913ec3405fd93a03`.
- Exact pre-closure Git tree: `90f8be32de2c12d0c08348dc060ae9492bad13f7`.
- Real verifier: authorised Desktop Commander device `CG`.
- Focused Step-8/9 + review/selection suite: **65/65 PASS**.
- Repository script suite: **230/230 PASS**.
- Package/runtime/source suite: **285/285 PASS**.
- Changed-file ESLint: **PASS**.
- TypeScript / Next.js 16.3.6 production build: **PASS**.
- Static export: **30/30 routes generated**.
- Whole-branch obsolete-carrier guard: **PASS**.
- Latest MaintenanceOS compatibility baseline rechecked before closure: `5eb0f92f2633e20e4d280835d3e6577e3f206c8b`.
- No live provider mutation was executed; all provider tests used injected/mock transports.
- The existing verifier directory contained an unrelated untracked directory, so final freeze integrity will be proved in a fresh detached Git worktree rather than deleting unrelated local content.

## Non-scope

- No live phone call.
- No phone-number purchase, port or transfer.
- No provider mutation deployed or executed against the live MaintenanceOS number in this step.
- No activation of a new voice runtime/provider/model.
- No direct MaintenanceOS database mutation.
- No email/CRM business action execution.
- No public-launch change.
- No `ready -> active` lifecycle change.
- No Step-10 end-to-end commissioning.
