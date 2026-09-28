# MaintenanceOS Provisioning Gateway Contract

**Status:** Agent Factory Step 8 server-side contract  
**Audience:** trusted internal control-plane callers only  
**Public/browser use:** forbidden

The provisioning gateway is the only approved server-side boundary for moving an
AgentBlueprint from `sandbox_passed` into `provisioning`. It does not expose
production credentials to the browser, does not write directly to the frozen
MaintenanceOS database, and does not attach phone numbers or enable integrations.

## Runtime

- Command: `npm run provisioning-gateway`
- Default host: `127.0.0.1`
- Default port: `8792`
- Master flag: `PROVISIONING_GATEWAY_ENABLED=false`
- Durable state: `.data/provisioning-gateway-state.json` by default
- No `NEXT_PUBLIC_*` provisioning variable exists.
- No CORS allow-origin header is emitted.
- Any request carrying a browser `Origin` header is rejected.

The current file store is for one gateway process. Do not run multiple gateway
processes against the same state file. A future scale-out design must replace the
store behind the existing interface rather than bypassing the gateway.

## Health

`GET /health`

Returns boolean/bounded service state only:

- gateway enabled
- authentication configured
- browser access false
- telephony false
- provider mutation false
- direct product database access false
- request path

It never returns key IDs, secrets, tenant lists or provisioning records.

## Create provisioning request

`POST /v1/provisioning/requests`

`Content-Type: application/json`

Required server-to-server authentication headers:

- `X-MOS-Key-Id`
- `X-MOS-Timestamp` — Unix epoch milliseconds
- `X-MOS-Nonce` — unique per signed attempt
- `Idempotency-Key` — reused for a logical retry
- `X-MOS-Signature` — lowercase HMAC-SHA256 hex

Signing payload:

```text
POST
/v1/provisioning/requests
<TIMESTAMP>
<NONCE>
<IDEMPOTENCY-KEY>
<SHA256(raw request body)>
```

The HMAC secret is server-only. The timestamp acceptance window is five minutes.
A valid nonce is consumed once and stored durably. A retry must use a new nonce
and the same idempotency key/body.

## Principal / tenant scope

Server-only environment:

```text
PROVISIONING_GATEWAY_PRINCIPAL_ID=
PROVISIONING_GATEWAY_KEY_ID=
PROVISIONING_GATEWAY_HMAC_SECRET=
PROVISIONING_GATEWAY_TENANT_REFS=tenant_a,tenant_b
```

The secret must be at least 32 characters. The authenticated principal may only
provision tenant references listed in its configured tenant scope. Cross-tenant
requests fail before a provisioning record is created.

## Request body

```json
{
  "tenantRef": "tenant_acme",
  "blueprint": { "...": "AgentBlueprint v1 at lifecycle sandbox_passed" },
  "qualification": {
    "version": "agent_sandbox_qualification_v1",
    "reviewRevisionId": "arv1_12345678",
    "source": "companion",
    "sessionId": "sandbox_sess_1",
    "testId": "sandbox_test_1",
    "complete": true,
    "checks": [],
    "failedCheckIds": []
  },
  "evidence": {
    "review": {},
    "session": {},
    "test": {}
  }
}
```

The compact qualification summary is not trusted by itself. The gateway
recomputes Step-7 qualification from the full review/session/test evidence using
the same canonical Step-7 policy, then requires both the resulting
`sandbox_passed` blueprint and qualification record to match exactly.

Any stale review, altered prompt/pack, changed transcript, mismatched session,
browser-mock-only evidence, live-call evidence or forged summary fails closed.

## Lifecycle transition

On first valid request:

`sandbox_passed -> provisioning`

Only `lifecycle.stage` may change. Identity, knowledge, permissions, rules,
integrations, privacy and compatibility remain identical.

The gateway creates a durable provisioning control record and returns an opaque
`prv_...` identifier. This does **not** mean a live MaintenanceOS client row,
carrier route, phone number or integration has been created.

## Idempotency

Idempotency scope is:

`principal + tenantRef + Idempotency-Key`

- first valid request: HTTP 201
- exact semantic retry with a fresh nonce: HTTP 200, same provisioning ID,
  `replayed: true`
- same idempotency key with different provisioning content: HTTP 409

## Success response

```json
{
  "ok": true,
  "data": {
    "provisioningId": "prv_...",
    "tenantRef": "tenant_acme",
    "status": "provisioning",
    "blueprintStage": "provisioning",
    "createdAt": "2026-09-27T18:45:00.000Z",
    "replayed": false
  }
}
```

The response never returns authentication secrets or the full stored evidence.

## Deferred work

Step 8 deliberately stops after secure provisioning handoff/control-record
creation.

- Step 9: phone-number and integration adapters.
- Step 10: complete end-to-end commissioning, readiness, rollback and controlled
  activation.

No code may bypass this boundary by giving a browser/model direct product
database, carrier, provider or administrative credentials.
