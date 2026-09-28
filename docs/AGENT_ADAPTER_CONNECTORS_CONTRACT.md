# Agent Adapter Connector Registry Contract

**Status:** Step 9 — server-only  
**Consumer:** `packages/provisioning-gateway`  
**Default:** provider mutation OFF

The adapter connector registry is operational configuration. It is never sent to the browser and never becomes part of website-derived AI instructions.

## Configuration

Set:

```
ADAPTER_CONNECTOR_REGISTRY_FILE=.data/agent-adapter-connectors.json
ADAPTER_MUTATIONS_ENABLED=false
```

Credential **values are not allowed in the registry**. The registry stores environment-variable names only.

## Twilio

```json
{
  "ref": "twilio_primary",
  "provider": "twilio",
  "kinds": ["telephony", "sms"],
  "accountSid": "AC00000000000000000000000000000000",
  "incomingPhoneNumberSid": "PN00000000000000000000000000000000",
  "publicBaseUrl": "https://voice.example.com/",
  "apiKeyEnv": "TWILIO_API_KEY",
  "apiSecretEnv": "TWILIO_API_SECRET"
}
```

The adapter reads the IncomingPhoneNumber first. For telephony it expects
`{publicBaseUrl}/voice/inbound`; for SMS it expects
`{publicBaseUrl}/messaging/inbound`, both with POST.

If a Voice Application/trunk or Messaging Application owns the corresponding
route, readiness fails closed instead of pretending the number-level URL is
effective.

## Calendar

```json
{
  "ref": "calendar_primary",
  "provider": "calendar_companion",
  "kinds": ["calendar"],
  "endpoint": "https://calendar.example.com/"
}
```

This reuses the existing calendar companion. Qualification requires an enabled
Google or Microsoft provider with client configuration and a stored OAuth token.
Mock calendar is not production-ready evidence.

## Signed HTTPS connector

```json
{
  "ref": "crm_primary",
  "provider": "signed_https",
  "kinds": ["crm"],
  "endpoint": "https://crm.example.com/",
  "secretEnv": "CRM_CONNECTOR_SECRET"
}
```

The readiness probe signs a server-to-server `GET /health` challenge with
HMAC-SHA256 using timestamp + nonce. The connector must confirm
`{ "ok": true, "ready": true, "kind": "crm" }`.

The same contract can be used for `email`.

## Readiness request

Authenticated internal request:

```
POST /v1/provisioning/adapters/prepare
```

```json
{
  "provisioningId": "prv_000000000000000000000000",
  "mode": "verify",
  "bindings": [
    { "kind": "telephony", "connectorRef": "twilio_primary" }
  ]
}
```

`mode:"verify"` is non-mutating. To permit a provider routing mutation, both
of these must be true:

1. server config has `ADAPTER_MUTATIONS_ENABLED=true`;
2. the authenticated signed request uses `mode:"apply"`.

Neither switch alone can mutate provider state.

## Invariants

- Bindings must exactly match the enabled integration intents already present in the reviewed AgentBlueprint.
- Connector refs remain readiness evidence, not post-review blueprint edits.
- A readiness record is immutable per provisioning ID.
- Success produces lifecycle `ready`, never `active`.
- Step 10 owns live commissioning and activation.
