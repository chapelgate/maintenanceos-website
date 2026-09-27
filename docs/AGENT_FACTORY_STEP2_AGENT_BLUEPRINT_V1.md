# Agent Factory Step 2 — AgentBlueprint v1

**Status:** FROZEN CANDIDATE — schema/validator contract only

## Baselines

- Website source: `chapelgate/maintenanceos-website` `2cc35d9f54536b02c808d91d3efb372655bc87af`
- Product compatibility baseline: `chapelgate/maintenanceos-v1-pilot` `3093dcd94317b1a44f04e5d6851bb7ad50568665`
- Product baseline date: 2026-09-27
- JSON Schema: Draft 2020-12
- OpenAPI: 3.2.1

## Scope

This step defines the versioned AgentBlueprint contract only. It does not alter the website UI, scanner, sandbox, provisioning, telephony, Twilio, Gemini, TTNC, databases, or the live MaintenanceOS phone path.

## Contract rules

1. `schemaVersion` is exactly `1.0.0`.
2. Compatibility is pinned to the verified product SHA above; older or unreviewed product baselines fail closed.
3. Website-derived knowledge is always marked `untrustedWebsiteContent: true`.
4. Agent type and capabilities come from bounded enums.
5. Unknown fields fail closed.
6. Credential-like keys (`api_key`, `secret`, `password`, `token`, `credential`, `auth`) are recursively rejected.
7. Integration entries carry only an opaque `connectorRef`; no secrets belong in a blueprint.
8. A capability cannot be present in both `permissions.allow` and `permissions.deny`.
9. Business and provenance URLs are HTTPS-only.
10. Lifecycle state is explicit and bounded; this schema itself cannot provision or activate anything.

## Artifacts

- `contracts/agent-blueprint-v1.schema.json` — canonical JSON Schema.
- `contracts/agent-blueprint-v1.openapi.yaml` — OpenAPI 3.2.1 schema surface; no endpoints yet.
- `src/lib/agent-blueprint.ts` — TypeScript types, pinned baseline constants, strict runtime validator.
- `src/lib/agent-blueprint.test.ts` — focused fail-closed regression suite.

## Acceptance

Step 2 is complete only when:

- the canonical valid fixture passes both runtime and JSON Schema validation;
- stale product baseline is rejected;
- unexpected fields are rejected;
- credential-shaped fields are rejected;
- `untrustedWebsiteContent=false` is rejected;
- overlapping allow/deny capabilities are rejected;
- HTTP provenance/business URLs are rejected;
- unknown capabilities and lifecycle stages are rejected;
- existing website tests/build remain green before merge.

No Step 3 scanner work is included in this change.
