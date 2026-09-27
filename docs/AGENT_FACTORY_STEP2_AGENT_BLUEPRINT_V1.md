# Agent Factory Step 2 — AgentBlueprint v1

**Status:** VERIFIED CANDIDATE — ready for freeze/merge

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

## Verification evidence

- Runtime regression suite: 8/8 PASS.
- TypeScript strict standalone compile: PASS (`tsc 5.8.3`).
- JSON Schema Draft 2020-12 meta-schema validation: PASS.
- OpenAPI YAML parse: PASS.
- GitHub base-to-branch diff: exactly five Step-2 files added; zero existing files modified.
- Product baseline recheck before candidate verification: `3093dcd94317b1a44f04e5d6851bb7ad50568665` remained latest.

## Acceptance

- Valid blueprint accepted: PASS.
- Stale product baseline rejected: PASS.
- Unexpected fields rejected: PASS.
- Credential-shaped fields rejected: PASS.
- `untrustedWebsiteContent=false` rejected: PASS.
- Overlapping allow/deny capability rejected: PASS.
- HTTP business/provenance URLs rejected: PASS.
- Unknown capability/lifecycle values rejected: PASS.

Full website UI, scanner and provisioning changes are intentionally out of scope. No Step 3 work is included.
