# Cloud Route Notes

## Reconciled 2026-09-18

- DigitalOcean droplets now exist: `maintenanceos-production-voice` `601962983` `165.227.227.9` and `maintenanceos-phone-staging` `602165089` `138.68.137.113` ($12 each). Clone `602160871` is gone. Do **not** create another MOS droplet.
- Active public runtime: Render Lane A `maintenanceos-redteam-v2` (`/health` 200, realtime_voice true, armed 3/10 as of 2026-09-20T11:47:59Z).
- App Platform `maintenanceos-london` is absent. Live MOS marketing site is starter-static `seahorse-app` → `https://seahorse-app-4oasq.ondigitalocean.app`.
- Provision blocked until renewable MOS→USH workload identity is established (Ed25519 key + auto-refresh). Do not inject DigitalOcean tokens into Cursor — already vaulted in USH as `DO_USH_DEPLOY`. Do not persist 3600s USH bearers as permanent secrets.
- HLO / Evidence Wallet / Cheap Trips DO hosts are out of scope.
- See `docs/migration/DO_MIGRATION_REPORT.md`.
