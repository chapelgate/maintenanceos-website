# Agent Factory Step 8 — Secure Provisioning Gateway

**Status:** VERIFIED — ready to freeze/save  
**Scope:** create the authenticated, replay-safe, tenant-isolated server boundary
from a verified `sandbox_passed` AgentBlueprint into the provisioning control
plane. Do not attach telephony/integrations or activate a live agent.

## Baselines

- Parent frozen Step-7 checkpoint:
  `db264b4abec24b6e0b62c92aafc3a3525263ce4f`.
- MaintenanceOS compatibility baseline:
  `5eb0f92f2633e20e4d280835d3e6577e3f206c8b`.
- Frozen MaintenanceOS runtime/database remains untouched.

## Acceptance contract

1. Provisioning endpoint is server-to-server only; browser `Origin` is rejected
   and no CORS allow-origin is emitted.
2. No provisioning credential appears in `NEXT_PUBLIC_*` or the static website
   source graph.
3. Gateway is disabled by default.
4. Requests require HMAC-SHA256 authentication over method, path, timestamp,
   nonce, idempotency key and raw-body SHA256.
5. Timestamp must be inside a five-minute window.
6. Every signed attempt uses a one-time nonce; replayed nonces fail.
7. Authenticated principal is bound to explicit tenant references; cross-tenant
   provisioning fails closed.
8. Only schema-valid AgentBlueprint v1 at `sandbox_passed` is accepted.
9. Step-7 qualification summary is not trusted alone. Gateway recomputes the
   exact review/session/test qualification and requires exact blueprint +
   qualification equality.
10. First accepted request creates one durable provisioning record.
11. Exact retry with a fresh nonce and same idempotency key/content returns the
    same provisioning ID.
12. Reusing an idempotency key with different content fails with conflict.
13. Successful handoff changes lifecycle only:
    `sandbox_passed -> provisioning`.
14. Gateway does not write directly to the frozen product database and does not
    touch carriers, phone numbers, calendar/email/CRM/SMS connectors or live
    voice.
15. Step 9 owns phone/integration adapters. Step 10 owns end-to-end commissioning
    and controlled activation.

## Implementation

- Added `packages/provisioning-gateway` using only Node built-ins and existing
  Agent Factory policy modules.
- Added persistent single-process file store with restrictive file mode and
  fail-closed corrupt-state handling.
- Added HMAC/timestamp/nonce authentication with constant-time signature compare.
- Added tenant-scoped principal authorization.
- Added deterministic semantic request hashing and durable idempotency.
- Reused `qualifyAgentSandbox` to recompute Step-7 evidence server-side rather
  than trusting a browser-produced lifecycle/summary.
- Added `POST /v1/provisioning/requests` and bounded `GET /health`.
- Added no Next.js route, browser client, database library, carrier SDK, provider
  SDK, queue, new infrastructure or paid dependency.
- Added root `npm run provisioning-gateway`; package tests are part of normal
  `npm test`.

## Debugging / hardening added

- Durable nonce state makes replay failures reproducible across process restart.
- Durable idempotency record stores request hash and provisioning record for
  deterministic retry/conflict diagnosis.
- Health reports only booleans/bounded capability state; secrets/tenant scopes
  are never emitted.
- Full Step-7 evidence is retained in the signed request but not returned in the
  public receipt.

## Defects found before closure

- A qualification summary was initially insufficient to prove it belonged to the
  supplied blueprint. Fixed by canonical server-side Step-7 recomputation.
- Node strip-only TypeScript rejected a constructor parameter property. Fixed
  with an explicit class field; no transpiler workaround added.
- Four explicit-`any` test casts failed lint. Fixed by typing the fixture as the
  real provisioning input.

## Verification state

- Exact pre-closure engineering candidate: `a6f1414098aad6de8b4910bf6386f63060b74dd1`.
- Exact Git tree verified: `bba53436eafa21ab6b6fa2d89bb0978a5641e59b`.
- Real verifier: authorised Desktop Commander device `CG`.
- Gateway security/runtime tests: **19/19 PASS**.
- Architecture wiring tests: **6/6 PASS**.
- Repository script suite: **222/222 PASS**.
- Package/runtime/source suite: **268/268 PASS**.
- Changed-package ESLint: **PASS**.
- TypeScript / Next.js 16.3.6 production build: **PASS**.
- Static export: **30/30 routes generated**.
- Exact tree integrity before/after verification: **PASS**.
- Latest MaintenanceOS compatibility baseline rechecked before freeze: `5eb0f92f2633e20e4d280835d3e6577e3f206c8b`.
- No live telephony/provider/carrier/database/deployment/infrastructure mutation occurred.
- Verifier DNS/thread exhaustion prevented a normal fetch, so the candidate was reconstructed from GitHub blobs and accepted only after its local Git tree hash exactly matched the GitHub commit tree.

## Non-scope

- No live phone call.
- No number provisioning or carrier route.
- No connector activation.
- No direct MaintenanceOS database mutation.
- No `ready` or `active` lifecycle transition.
- No Step-9 adapter implementation.
- No Step-10 controlled rollout/deployment.
