# Fix

Add `.github/workflows/do-readonly-inventory.yml`:
- trigger: `workflow_dispatch` only
- permissions: `contents: read`
- GitHub-hosted `ubuntu-latest` (no self-hosted runner)
- DigitalOcean API GET calls only (`/account`, `/droplets`, `/firewalls`, `/vpcs`); output limited to names, status, IPs, firewall rules and tags; the token is never echoed (GitHub masks secrets as well)
- no third-party actions

Rollback: delete the file, or `gh workflow disable do-readonly-inventory.yml -R chapelgate/maintenanceos-website`.
