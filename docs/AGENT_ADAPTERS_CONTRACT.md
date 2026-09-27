# MaintenanceOS Agent Adapter Contract

**Status:** Agent Factory Step 9 server-side contract  
**Public/browser use:** forbidden  
**Activation:** deferred to Step 10

## Runtime boundaries

Adapter webhook companion:

- command: `npm run agent-adapters`
- default host: `127.0.0.1`
- default port: `8793`
- master flag: `AGENT_ADAPTER_WEBHOOKS_ENABLED=false`
- no CORS allow-origin
- browser `Origin` rejected
- no carrier/provider mutation

Provisioning gateway preparation:

- `POST /v1/provisioning/adapters/prepare`
- same HMAC/timestamp/nonce authentication as Step 8
- same tenant-bound principal
- separate durable adapter idempotency state

## Server-only connector registry

`AGENT_CONNECTOR_REGISTRY_JSON` contains non-secret connector metadata.

A blueprint stores only:

```json
{
  "kind": "calendar",
  "connectorRef": "calendar-main",
  "enabled": true
}
```

Provider identity remains server-side. For example, `calendar-main` can resolve
to a Google provider during one preparation and a Microsoft provider during a
later preparation without changing the core agent configuration.

## TTNC existing-number connector

TTNC connector metadata contains:

- stable connector ref
- existing TTNC number
- TTNC Application ID for inbound-call webhooks
- public HTTPS webhook URL

The TTNC Application Secret Key is stored separately in
`TTNC_WEBHOOK_SECRETS_JSON`, keyed by connector ref. It is never returned,
stored in AgentBlueprint or exposed through `NEXT_PUBLIC_*`.

### Webhook verification

Endpoint shape:

`POST /v1/telephony/ttnc/{connectorRef}/webhook`

Required header:

`Webhook-Signature`

Verification:

`HMAC-SHA256(raw POST body, TTNC Application Secret Key)`

Comparison is constant-time. Invalid signatures are HTTP 401. The Step-9
receiver returns only bounded event type/reference acknowledgement and performs
no downstream action.

TTNC source:
https://help.ttnc.co.uk/docs/webhooks

### SetApplication activation plan

Step 9 prepares, but does not send:

```xml
<?xml version="1.0"?>
<NoveroRequest>
  <Request target="NoveroNumbers" name="SetApplication" id="MaintenanceOS">
    <Number>...</Number>
    <call_api_vkey_id>...</call_api_vkey_id>
  </Request>
</NoveroRequest>
```

Target documented by TTNC:

`https://xml.ttnc.co.uk`

TTNC documents that API access requires an enabled account/Application VKey and
permitted source IPs. Those credentials are not required or stored by Step 9
because no API mutation occurs.

TTNC sources:
- https://help.ttnc.co.uk/docs/webhooks
- https://help.ttnc.co.uk/reference/api

## External connector kinds

The same registry supports:

- `telephony`
- `calendar`
- `email`
- `crm`
- `sms`

Only one connector per integration kind may be prepared for one blueprint.
Provider-specific credentials remain outside AgentBlueprint.

## Lifecycle

Input:

`provisioning`

Successful Step-9 preparation:

`ready`

Only `integrations` and `lifecycle.stage` may change. `ready` means
configuration is prepared for controlled commissioning; it is not evidence that
a phone number, provider route or external integration is live.

## Step 10 boundary

Step 10 must independently verify this ready record before any external
mutation. It owns:

- TTNC/Application association or other carrier mutation
- call-forwarding/routing activation
- test number and real PSTN acceptance
- calendar/email/CRM/SMS live-action checks
- rollback
- final `active` transition
