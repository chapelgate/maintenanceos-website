# Onboarding Scan Cost Retirement — 2026-09-28

Status: **BLOCKED AT PROVIDER MUTATION / SAFETY PROOF COMPLETE**

## Narrow scope
Remove only the paid DigitalOcean App Platform service `onboarding-scan` from app `seahorse-app` while preserving the free static MaintenanceOS website and the frozen MaintenanceOS telephone runtime.

## Live provider evidence
DigitalOcean invoice preview identifies:
- app UUID: `98e3a9c0-3b3c-48eb-ac72-2b13ffbe2661`;
- app: `seahorse-app`;
- paid component: `onboarding-scan`;
- SKU: `apps-s-1vcpu-0.5gb`;
- nominal recurring target: $5/month.

Live route checks:
- `/` => 200 HTML;
- `/create/` => 200 HTML;
- `/onboarding-scan/health` => 200 JSON with `service=maintenanceos-onboarding-scan` and `ingestEnabled=true`;
- `/onboarding-scan/v1/onboarding/scan` => 405 on GET, proving the service route exists.

## Critical dependency finding
The deployed static browser bundle currently contains the absolute endpoint:

`https://seahorse-app-4oasq.ondigitalocean.app/onboarding-scan/v1/onboarding/scan`

Therefore deleting the service **now** would break the live `/create` website-scan flow.

This is separate from MaintenanceOS telephony. The frozen phone runtime is not hosted by this App Platform service.

## Canonical architecture
The website source already supports a claims-safe queued fallback when the scan endpoint is unset. Repository documentation also defines the intended hosted scan as a separate companion and explicitly separates it from frozen telephony.

## Required safe sequence
1. Remove/unset `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` at App Platform build scope and rebuild the static site, or otherwise produce a static build that no longer contains the paid endpoint.
2. Verify `/create/` remains 200 and its compiled scripts no longer contain the endpoint.
3. Retrieve the current App Platform spec.
4. Remove only service `onboarding-scan` and only ingress rules targeting that component.
5. Preserve every static site and all unrelated components/configuration.
6. Apply the updated spec.
7. Verify root and `/create/` remain 200 and `/onboarding-scan/health` is no longer 200.
8. Roll back the original spec automatically if verification fails.

## Guard tooling
`scripts/remove-onboarding-scan-service.py` implements the provider-side fail-closed portion. It defaults to dry-run, refuses while the live bundle references the service, refuses if no static site remains, requires exactly one target service, requires an exact apply confirmation string, and restores the original spec if post-change health fails.

## Current blocker
The connected DigitalOcean integration does not expose App Platform GET/PUT operations. The authorised machine has no `doctl`, no DigitalOcean token in environment/config, and no repository DigitalOcean API secret. Plugin discovery found no separate App Platform-capable DigitalOcean integration.

A scoped DigitalOcean token with `app:read` + `app:update`, or an authenticated App Platform control surface accessible to the agent, is required to execute the final mutation.

No destructive action was taken.
