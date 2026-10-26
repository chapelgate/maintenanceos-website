# mw-57-status-uptime-lock

## Problem
The status page already denies live uptime, but nothing dedicated locks that honesty against regression.

## Acceptance
- Status page states there is no public production service and no live uptime metrics.
- It forbids fake uptime charts, incident timelines, and SLA badges.
- It stays noindex and does not invent percentages or launch flags.
- `node --test scripts/status-uptime-lock.test.mjs` exits 0.