# Test

- `npx tsc --noEmit`: exit 0.
- `npm run lint`: exit 0.
- `npm test`: exit 0. Script tests 249 pass. Package and lib tests 445 pass. 0 failed. 0 cancelled.
- `npm run build`: static export exit 0, including `/icon.png`.
- Local `out/` smoke: `/`, `/create/`, `/about/`, `/favicon.ico`, and all 27 sitemap URLs returned 200. Homepage and `/create/` do not contain "National Gas Emergency Service". Homepage still has the "Smell gas?" link. `/about/` says the sector lines are separate planned products. Mobile 390px: `scrollWidth` equals `clientWidth`.
- Zero-fetch classifier, reseed, favicon, voice config, gas layout, scan proxy, and about copy each have a focused test.

- S10: the retired Railway host returns 404 Application not found on `/`, `/health`, `/v1/public/website-leads` and `/v1/public/website-events`. With no working endpoint, lead pages show the mailto fallback and the measurement beacon does not fetch.

Verdict: verified locally before merge. Live release marker is checked after merge if App Platform auto-deploy runs.
