# Scanner V2 DigitalOcean runtime cutover

Status: implementation in progress
Date: 2026-10-05

## Objective

Restore the live website scan path and complete Scanner V2 production canary using only the already-created DigitalOcean Scanner V2 droplet and the already-existing DigitalOcean Function/App route.

## Acceptance

All of the following must be true on one exact candidate SHA:

- existing droplet `606110383` / `maintenanceos-scanner-v2` is reused; no second runtime is created;
- Scanner V2 runs from the verified companion image with durable state on the droplet;
- public runtime is available over trusted HTTPS;
- `ONBOARDING_WEB_INGEST=true`, `ONBOARDING_SCANNER_V2=true`, and `SCANNER_V2_RELEASE_SHA` equals the deployed source SHA;
- direct Scanner V2 health and bounded scan canary pass;
- existing DigitalOcean Function `website/scan` remains the browser-facing proxy and is configured to the DigitalOcean runtime, with no hidden Railway use on the accepted canary path;
- live same-origin `POST /api/website/scan` returns a scanner response rather than the current platform-level incomplete-function-path error;
- real mobile `/create` website-learning and browser receptionist acceptance passes with zero runtime exceptions and zero lead/save side effects before optional Save;
- exact deployed website SHA is read back;
- production telephony, carrier routing, live numbers, voice runtime and the MaintenanceOS golden phone line remain untouched.

## Current reproduced failures

1. `POST https://seahorse-app-4oasq.ondigitalocean.app/api/website/scan` returns HTTP 400 with DigitalOcean platform error: `Incomplete web function path`.
2. Existing Scanner V2 droplet is active but ports 80/443 are not currently serving the runtime.
3. The existing Function proxy supports `SCANNER_V2_RUNTIME_URL`, but source fallback still points to Railway and provider state has not yet been proven to use the DigitalOcean runtime.

## Boundaries

- no Render;
- no new droplet, app, namespace, database, queue, router or control plane;
- no password reset or new long-lived credential;
- reuse `DIGITALOCEAN_ACCESS_TOKEN` already present in the repository;
- any SSH key copied into GitHub is temporary, scoped to this deployment, never printed, and removed immediately after successful/failed completion;
- no telephony/provider voice changes.
