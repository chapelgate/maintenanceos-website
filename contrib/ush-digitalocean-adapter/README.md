# USH DigitalOcean provider — contribution / contract mirror

This tree documents the DigitalOcean provider adapter contract expected by
MaintenanceOS. The **live** USH control plane already reports:

```json
{"digitalocean":{"registered":true,"adapter_class":"live_http","profile":"DO_USH_DEPLOY"}}
```

Source of truth for implementation code is
`github.com/chapelgate/chapelgate-universal-secrets-handler.` (trailing period).
This MaintenanceOS Cloud Agent environment currently only includes
`maintenanceos-v1-pilot`, so adapter source edits must land in USH after that
repo is added to the environment.

## Adapter contract (USH 0.3.0)

| Concern | USH surface |
| --- | --- |
| Health | `GET /health` → `digitalocean.registered` |
| Capability grant | `POST /v1/credentials/request` (`RequireBody`) |
| Brokered ops (preferred) | `POST /v1/operations/request` (`OperationBody`) |
| Invoke | `POST /v1/credentials/{id}/invoke` |
| Rotate / revoke | `POST /v1/credentials/{id}/rotate` / `revoke` |
| Policy isolation | `POST/GET /v1/admin/policy/rules` |
| Secret import (admin) | `POST /v1/admin/secrets/import` — **never** via MOS agents |

### Required DigitalOcean operations

- `health` / `validate` — token presence + `GET https://api.digitalocean.com/v2/account`
- `discover` — list apps/droplets filtered by project tags / name prefix
- `apps.list` / `apps.get` / `apps.create` / `apps.update`
- `droplets.list` (read-only unless explicitly granted)
- `rotate` / `revoke` — vault lifecycle for `DO_USH_DEPLOY` / `DO_READONLY`

### Least privilege

- Runtime profile `DO_USH_DEPLOY`: App Platform write for MaintenanceOS only
- Read profile `DO_READONLY`: inventory / health
- Tokens never returned to coding agents; delivery_mode defaults to `capability_ref`

### Isolation

Policy must deny `project!=maintenanceos` principals from `digitalocean` `apps.deploy`
unless an explicit allow rule exists. See MOS `ush_client.assert_project_isolation`.

## Bootstrap (DO account credential)

If USH has **no** valid DigitalOcean credential in its vault, humans perform a
**one-time** secure import into USH only (not Cursor, not chat, not Git).

Evidence as of 2026-09-18: vault profile `DO_USH_DEPLOY` is present — **do not
re-ask Andy for a DigitalOcean token**.
