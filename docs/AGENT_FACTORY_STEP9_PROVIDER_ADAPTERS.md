# Agent Factory Step 9 — Provider Adapters

**Status:** IMPLEMENTED CANDIDATE — full repository verification required before freeze  
**Scope:** prepare server-side phone/external connector bindings for a Step-8
`provisioning` record, verify TTNC webhook authenticity, and advance only
`provisioning -> ready`. Do not activate a carrier route or external action.

## Baselines

- Parent frozen Step-8 checkpoint:
  `5a7d097924ac004fb08f488ee5b5c5b28f8bbf23`.
- MaintenanceOS compatibility baseline:
  `5eb0f92f2633e20e4d280835d3e6577e3f206c8b`.
- Live MaintenanceOS voice runtime remains a separate frozen workstream.

## Grounded TTNC contract

Implementation follows the current TTNC developer documentation:

- TTNC webhooks are HTTP POST JSON payloads.
- TTNC sends `Webhook-Signature`.
- The signature is an HMAC-SHA256 hex digest of the exact POST body using the
  myTTNC Application Secret Key.
- TTNC `NoveroNumbers::SetApplication` associates a number with an Application
  by `Number` and `call_api_vkey_id`.
- TTNC API mutation uses XML requests to `https://xml.ttnc.co.uk` and requires
  TTNC account/API configuration including permitted source IPs.

Primary references:
- https://help.ttnc.co.uk/docs/webhooks
- https://help.ttnc.co.uk/reference/api

Step 9 generates a `SetApplication` XML activation plan but does not send it.

## Acceptance contract

1. Provider adapters are server-side only; no adapter or TTNC secret may enter
   `NEXT_PUBLIC_*` or the static browser source graph.
2. Connector identity in AgentBlueprint remains a stable `connectorRef`.
   Provider identity is resolved server-side from the connector registry.
3. External provider metadata can change for the same connectorRef without
   rebuilding or changing the core AgentBlueprint.
4. The first telephony implementation is TTNC existing-number preparation.
5. TTNC webhook verification uses the raw request body and constant-time
   HMAC-SHA256 comparison against the server-only Application Secret Key.
6. Browser-origin webhook requests are rejected; no CORS allow-origin is emitted.
7. Webhook acceptance has no carrier/product side effect in Step 9.
8. TTNC `SetApplication` request XML is generated deterministically and records
   `mutationPerformed=false`.
9. Calendar, email, CRM and SMS use the same server-side connector registry and
   are attached only by validated connectorRef.
10. Adapter preparation is callable only through the authenticated Step-8
    provisioning gateway.
11. The authenticated principal must own the provisioning record and remain in
    the same tenant scope.
12. Adapter preparation is durable and idempotent; an idempotency key reused
    with different adapter content fails closed.
13. Old Step-8 version-1 state files migrate to Step-9 version 2 without losing
    provisioning records.
14. Successful preparation changes only `integrations` and lifecycle:
    `provisioning -> ready`. Identity, knowledge, permissions, rules and privacy
    remain unchanged.
15. `ready` means connector configuration is prepared for controlled
    commissioning. It does not mean the TTNC route, calendar, email, CRM, SMS or
    voice service has been activated.
16. Step 10 owns carrier/provider mutation, controlled test calls, end-to-end
    commissioning, rollback and activation.

## Implementation

- Added `packages/agent-adapters`.
- Added server-only connector registry with stable connector refs.
- Added separate server-only TTNC secret registry.
- Added TTNC webhook raw-body HMAC verifier and event normalizer.
- Added deterministic TTNC `SetApplication` XML plan.
- Added provider-neutral preparation for calendar/email/CRM/SMS connector refs.
- Added `POST /v1/provisioning/adapters/prepare` to the existing authenticated
  provisioning gateway.
- Added durable adapter preparation/idempotency records to the Step-8 state
  store with version-1 migration.
- Added optional TTNC webhook receiver companion on loopback port 8793, disabled
  by default.
- Added no carrier SDK, paid dependency, direct MaintenanceOS DB write, Next.js
  route or browser credential.

## Debugging / hardening

- Provider swap is regression-tested using one stable calendar connectorRef with
  two different server-side providers; resulting ready AgentBlueprint is
  identical.
- TTNC body tampering and bad signature fail.
- Unknown connector, duplicate integration kind and missing TTNC secret fail.
- Cross-principal/tenant adapter preparation fails before a readiness record.
- Step-8 state migration is regression-tested.
- Public receipts omit TTNC number, generated XML and secrets.

## Defects found before closure

- Node strip-only TypeScript rejected a parameter property in the first secret
  registry implementation. Replaced with an explicit class field.
- A number-validator rename initially changed the use site but not the constant
  declaration. The real focused verifier caught the resulting ReferenceError;
  the declaration was corrected and the same tests rerun.

## Verification state

- Agent-adapter + provisioning focused tests: **39/39 PASS**.
- Architecture wiring tests: **6/6 PASS**.
- Changed Step-9 ESLint: **PASS**.
- Full repository tests/build: PENDING final freeze gate.

## Non-scope

- No TTNC API request sent.
- No call-forwarding/routing change.
- No live phone call.
- No calendar/email/CRM/SMS external action.
- No provider secret exposed to browser/model.
- No direct MaintenanceOS database mutation.
- No `active` lifecycle transition.
- No deployment/public-launch change.
