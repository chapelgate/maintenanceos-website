# Step 48 — automated uptime and deployment verification

Date: 2026-09-25
Owner: MOS Website Manager

## Reuse decision

Step 9 already created `scripts/website-health-monitor.mjs`. It always runs the sitemap, page, internal link, and static asset checks. The control-plane checks—the Postgres readiness check and the public-event CORS preflight—run only when `WEBSITE_CONTROL_PLANE` is set. Step 48 reuses that as the uptime/health check instead of creating a second crawler or monitoring service.

The missing control was deployment identity: a healthy site could still be an old build.

## Release marker

`npm run build` now runs `scripts/write-release-marker.mjs` before Next.js.

The generator determines the source commit from a provider commit environment variable or `git rev-parse HEAD`. If it cannot obtain a valid Git SHA, the build fails rather than publishing an unverifiable release.

It writes `public/release.json`, which is ignored by Git but copied into the static export. The marker contains:
- schema version;
- exact source commit SHA;
- build timestamp.

No secret or environment value is published.

## Checks

```bash
npm run uptime:check
```

Reuses the Step-9 live health monitor.

```bash
npm run deployment:verify
```

Checks that live `/release.json` matches local `HEAD` (or `EXPECTED_COMMIT`) with cache bypass, then runs the existing health monitor.

This means deployment verification requires both:
1. the intended source revision is live; and
2. the live pages/assets/backend integration are healthy.

## Cost / scheduling

No new monitoring SaaS, cron service, GitHub Actions job, app, database, or runner is introduced. The checks are deterministic repo commands used by the Website Manager release loop. Recurring external scheduling is deliberately not duplicated here.


## Live verification

Implementation PR #98 merged as `d50225a92654317e72d27a0a17d4479af7339e7d`.

The existing DigitalOcean deployment published:

- `/release.json` HTTP 200;
- schema `1`;
- commit `d50225a92654317e72d27a0a17d4479af7339e7d`;
- build timestamp `2026-09-25T19:16:44.974Z`.

`EXPECTED_COMMIT=d50225a92654317e72d27a0a17d4479af7339e7d npm run deployment:verify` returned `failures: []`, `ok: true`, then the reused health monitor checked 29 internal paths / 47 pages and assets with `failures: []`, `ok: true`.

Step 48 is therefore live-verified: the intended source revision and the healthy public deployment are proven together.
