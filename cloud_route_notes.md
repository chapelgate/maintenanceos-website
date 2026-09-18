# Cloud Route Notes

## Reconciled 2026-09-18

- No MaintenanceOS DigitalOcean droplet exists (confirmed; do not invent IDs).
- Active public runtime: Render Lane A `maintenanceos-redteam-v2` SHA `054b92b`.
- Permanent target: DigitalOcean App Platform London (`maintenanceos-london`) per `.do/app.yaml`.
- Provision blocked until USH grants MOS principal (`USH_WORKLOAD_TOKEN`). DO token must not be injected into Cursor — already vaulted in USH as `DO_USH_DEPLOY`.
- HLO / Evidence Wallet / Cheap Trips DO hosts are out of scope.
- See `docs/migration/DO_MIGRATION_REPORT.md`.
