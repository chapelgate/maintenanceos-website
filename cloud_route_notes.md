# Cloud Route Notes

## Reconciled 2026-09-18

- No MaintenanceOS DigitalOcean droplet exists (confirmed; do not invent IDs).
- Active public runtime: Render Lane A `maintenanceos-redteam-v2` SHA `054b92b`.
- Permanent target: DigitalOcean App Platform London (`maintenanceos-london`) per `.do/app.yaml`.
- Provision blocked until renewable MOS→USH workload identity is established (Ed25519 key + auto-refresh). Do not inject DigitalOcean tokens into Cursor — already vaulted in USH as `DO_USH_DEPLOY`. Do not persist 3600s USH bearers as permanent secrets.
- HLO / Evidence Wallet / Cheap Trips DO hosts are out of scope.
- See `docs/migration/DO_MIGRATION_REPORT.md`.
