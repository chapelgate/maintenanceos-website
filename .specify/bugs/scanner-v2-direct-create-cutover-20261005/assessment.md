# Assessment

## Goal lock

OBJECTIVE -> connect the existing static `/create` journey to the already-deployed Scanner V2 HTTPS runtime with fewer moving parts and no telephony change.

ACCEPTANCE CRITERION -> the static client receives its scanner endpoint from the existing `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` build variable; that variable is pinned to the approved Scanner V2 HTTPS URL; the direct endpoint passes CORS from the live MaintenanceOS origin; repository validation is green; no retired paid scanner service or new runtime is created.

EVIDENCE / REPRODUCTION -> the existing broad DigitalOcean Functions ingress returned `Incomplete web function path`. An exact Functions route reached the function but the managed runtime returned a generic processing error before the handler's own fail-closed JSON. Both attempted App-spec mutations rolled back automatically. The dedicated Scanner V2 runtime itself is healthy on accepted SHA `cadce5cf66740984aefb81c290265abe45c7ecd0`, its HTTPS edge is live, and direct CORS preflight from the MaintenanceOS origin returns 204 with the correct origin.

## Reuse / skill preflight

- Applied the Chapelgate Estate Gate and reuse-first rules.
- Reuse the existing dedicated Scanner V2 droplet and existing `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` hook design already documented by `docs/ONBOARDING_SCAN_DEPLOY.md`.
- The stale provider value was proven before source activation and replaced with `https://178-128-171-45.sslip.io/v1/onboarding/scan` while the current source still ignored the variable.
- No new droplet, queue, database, router, scheduler, control plane or telephony path.
- Work class: BUG.
