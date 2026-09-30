# Onboarding Scan Cost Retirement — 2026-09-28

Status: **WEBSITE DECOUPLED / PROVIDER DELETION BLOCKED BY INVALID CREDENTIAL**

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

## Critical dependency finding — resolved at website boundary
The public `/create` client no longer compiles or calls the paid onboarding-scan endpoint. Source fixes were merged in PR #130, an adversarial build with the obsolete provider variable set contained no endpoint match, and live browser verification observed the queued zero-scan path with no `/onboarding-scan/` request.

The paid provider component itself still exists: `/onboarding-scan/health` returns 200. Deleting it is now safe from the website-dependency perspective, subject only to valid provider mutation authority.

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
The repository now has an existing `DIGITALOCEAN_ACCESS_TOKEN` secret and the guarded retirement workflow can execute on an authorised self-hosted runner. However, DigitalOcean rejects that credential: guarded run `36746304812` passed live-source, dependency and unit guards, then the first App Platform GET failed with `HTTP Error 401: Unauthorized`. Apply was skipped and no provider mutation occurred.

The remaining action is to replace/refresh that repository secret with a valid token authorised for App Platform read/update on app `98e3a9c0-3b3c-48eb-ac72-2b13ffbe2661`, or connect an equivalent App Platform-capable authorised control path. Do not paste the token into chat.

Once valid authority exists, rerun the existing Step-5 retirement workflow against the exact deployed application SHA. It performs target-only removal, preservation checks and automatic rollback on failed post-change verification.
