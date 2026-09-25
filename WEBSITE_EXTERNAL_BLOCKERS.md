# MaintenanceOS Website External Blockers

**Owner:** MOS Website Manager  
**Updated:** 2026-09-25  
**Rule:** Only genuine external/manual blockers belong here. Exhaust safe authorised alternatives first.

## OPEN

### WB-001 — Existing DigitalOcean static app has not deployed Step 2

**Scope:** Website Manager Step 2 — brand and discoverability live rollout  
**Severity:** release blocker for Step 2 live verification  
**Source state:** FIXED and merged  
**Canonical website main:** `19dd1738ba9d029d8146cd23c029561483186a36`  
**Existing app:** `maintenanceos-website` / `seahorse-app-4oasq`  
**Live origin:** `https://seahorse-app-4oasq.ondigitalocean.app`

### Evidence

After the Step 2 merge, fresh live fetches still returned the previous build:

- homepage title: `MaintenanceOS — UK maintenance operations — website to knowledge pack`
- homepage body begins with the old bare-brand copy
- `/ai-receptionist/` still reports `AI receptionist · MaintenanceOS`
- `/llms.txt` still begins `# MaintenanceOS`

Expected after deployment:

- homepage title: `MaintenanceOS by Chapelgate — UK maintenance operations software`
- homepage identifies `MaintenanceOS by Chapelgate`
- AI receptionist metadata uses the new UK maintenance-intake title and public brand
- `/llms.txt` begins `# MaintenanceOS by Chapelgate`

### Exhausted safe routes

- GitHub source is merged to `main`.
- No paid GitHub Actions job was started.
- Connected DigitalOcean tools do not expose App Platform app/deployment writes.
- Existing USH DigitalOcean adapter brokers droplet/firewall/tag operations only; it has no App Platform deploy operation.
- Creating a second app is forbidden and unnecessary.
- Opera Browser Connector is not currently connected, so the existing authenticated DigitalOcean UI cannot be operated through it.
- Metered browser automation is not authorised because this work must not add spend.
- No credential entry into chat is required or requested.

### Exact external action

Use **one** of these existing-resource routes only:

1. In DigitalOcean, open the existing App Platform static app `maintenanceos-website` / `seahorse-app-4oasq` and trigger **Create Deployment / Force Rebuild and Deploy** from the current `chapelgate/maintenanceos-website` `main`; **or**
2. Reconnect the Opera Browser Connector with the already-authenticated DigitalOcean tab so the Website Manager can trigger the rebuild.

Do **not** create a new DigitalOcean app, droplet, paid service, GitHub Actions workflow, or new credential.

### Close condition

WB-001 closes only after a fresh live fetch proves the new title, public brand attribution, AI-receptionist metadata, and updated `llms.txt`.

## CLOSED

None yet.
