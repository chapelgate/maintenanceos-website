# MaintenanceOS website source of truth

**Status:** AUTHORITATIVE  
**Verified:** 2026-09-25  
**Scope:** public/pre-launch MaintenanceOS marketing website only

## Canonical source

- Repository: `chapelgate/maintenanceos-website`
- Release branch: `main`
- Framework: Next.js App Router + TypeScript
- Hosting build: `npm run build`
- Static artifact: `out/`
- Hosting model: DigitalOcean App Platform **static site**
- DigitalOcean app label: `maintenanceos-website`
- Recorded App Platform slug/host: `seahorse-app-4oasq`
- Staging origin: `https://seahorse-app-4oasq.ondigitalocean.app`
- Public launch remains disabled unless launch gates explicitly change: `NEXT_PUBLIC_PUBLIC_LAUNCH=false`

Do not create a second MaintenanceOS marketing site or a second marketing repository.

## Product boundary

`chapelgate/maintenanceos-v1-pilot` is the canonical MaintenanceOS **product/backend** repository.

It owns product capability evidence, voice/runtime logic, deterministic safety/lifecycle rules, and the operational dashboard. It is **not** the marketing-site source.

The marketing repository may describe product capabilities only when supported by `PRODUCT_CLAIMS_REGISTER.md` and product evidence. It must not become a competing backend implementation.

## Deployment evidence

The website repository's own staging runbook (`docs/STAGING_COMPANIONS.md`) identifies the DigitalOcean App Platform static app as `maintenanceos-website` / `seahorse-app-4oasq` and records the staging origin above.

Repository history also records the same DigitalOcean static deployment relationship in commit `b2767697078100b58d3148de2d247d3be5e35a83`.

The product repository independently recorded the same live starter-static site and host during estate reconciliation in commit `176a82799815b1677b5ea8a312eb8d16f3d17684`.

## Branch rule

`main` is the authoritative release source for the website.

The currently connected DigitalOcean tool surface does not expose App Platform source-link metadata, so the provider-side branch selector cannot be independently read from this agent session. Do not invent a different branch. Any future provider-side change must verify that the App Platform static component tracks `chapelgate/maintenanceos-website` `main` before changing build/deploy settings.

This limitation is a read-only provider-metadata gap, not permission to create another app.

## Duplicate check

Connected Chapelgate repositories were enumerated on 2026-09-25. There is one dedicated MaintenanceOS marketing repository: `chapelgate/maintenanceos-website`.

- `chapelgate/maintenanceos-v1-pilot` is the backend/product repository, not a duplicate website.
- `chapelgate/chapelgate-technologies-website` is a separate corporate site and contains no MaintenanceOS website source in the checked search.
- `chapelgate/cloud-workers` is shared/legacy infrastructure, not the website source.

No duplicate MaintenanceOS marketing repository should be created.

## Rollback

Known pre-Step-1 website `main` pin:

`cc824a8981620c6c5483f4e742fbf3feaf1cef83`

For a website regression caused by a later website change, revert the offending website commit or redeploy the last known-good website commit. Do not roll back or modify the MaintenanceOS voice/backend estate merely to repair the marketing site.

## Change authority

Website changes belong here first. Product capability claims must be checked against the product repository and claims register. Telephony/runtime changes belong in the product repository, not this website repository.

## Step 1 status

- 1.1 exact website source identified — **PASS**
- 1.2 deployment path recorded — **PASS**, with provider-side branch-selector readback noted above
- 1.3 marketing vs product source compared — **PASS**
- 1.4 duplicate website source check — **PASS**
- 1.5 authoritative source/deploy/rollback record created — **PASS**
