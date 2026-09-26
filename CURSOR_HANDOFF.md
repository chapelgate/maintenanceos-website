# MaintenanceOS website handoff

**Updated:** 2026-09-26
**Scope:** marketing website only
**Canonical repository:** `chapelgate/maintenanceos-website`
**Release branch:** `main`

This is a thin operator handoff, not a second backlog.

## Start here

1. Read `WEBSITE_SOURCE_OF_TRUTH.md`.
2. Read `WEBSITE_BACKLOG.md` — it is the single persistent problem register.
3. Read `PRODUCT_CLAIMS_REGISTER.md` before changing public claims. Current signed product checkpoint: `cc682c3e5dc5a50e6d8ea695767b3e0f1f6f09c8` (2026-09-26).
4. Read `docs/STEP50_WEBSITE_MANAGER_LOOP.md` before a release.
5. Keep `NEXT_PUBLIC_PUBLIC_LAUNCH=false` until the launch checklist is cleared.

## Normal engineering loop

```bash
npm run manager:monitor
npm run manager:preflight
# merge through a PR into main
EXPECTED_COMMIT=<merge-sha> npm run manager:verify
WEBSITE_MANAGER_PR_NUMBER=<pr-number> npm run manager:record
```

Do not create a second website, hosting app, deployment path, problem register,
agent board, or monitoring stack to work around a documentation gap.

## Current deployment

- DigitalOcean App Platform static export
- live/staging origin: `https://seahorse-app-4oasq.ondigitalocean.app`
- build: `npm run build` -> `out/`
- companions, when explicitly authorised, are separate processes; do not turn
  this static site into a Node service.
- Render is legacy for website companions. Follow `docs/STAGING_COMPANIONS.md`.

## Safety boundaries

- Marketing code must not modify frozen/live telephony.
- No secrets belong in Git or `NEXT_PUBLIC_*`.
- Present-fact claims must stay inside the signed claims register.
- Legal pages remain draft until counsel clears them.
- A healthy old deployment is not enough: the release marker must match the
  intended merge SHA.

## Where evidence lives

- source/deployment/rollback: `WEBSITE_SOURCE_OF_TRUTH.md`
- backlog/status: `WEBSITE_BACKLOG.md`
- launch gates: `WEBSITE_LAUNCH_CHECKLIST.md`
- security: `WEBSITE_SECURITY_REVIEW.md`
- performance: `docs/STEP46_PERFORMANCE_BASELINE.md`
- accessibility: `docs/STEP47_ACCESSIBILITY_BASELINE.md`
- exact deployment verification: `docs/STEP48_DEPLOYMENT_VERIFICATION.md`
- rollback controls: `docs/STEP49_RELEASE_ROLLBACK.md`
- product evidence refresh: `docs/CONTINUATION_STEP3_PRODUCT_EVIDENCE_REFRESH.md`
- closed-loop release process: `docs/STEP50_WEBSITE_MANAGER_LOOP.md`
