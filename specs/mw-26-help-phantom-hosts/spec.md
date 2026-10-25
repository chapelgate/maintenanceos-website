# mw-26-help-phantom-hosts

## Problem

Getting Help listed a YouTube channel plus community, roadmap, docs, and status hostnames as if those sites were live, and it published a training programme the site does not run.

## Cause

The support article was written with public destinations and sessions that this pre-launch site does not operate.

## Acceptance

- `getting-help.mdx` does not contain `youtube.com/@MaintenanceOS`, `community.maintenanceos.co.uk`, `roadmap.maintenanceos.co.uk`, `docs.maintenanceos.co.uk`, or `status.maintenanceos.co.uk`.
- The same hostnames are absent from every file in `src/content/help`.
- Getting Help says the YouTube channel, community, status page, and training programme are not live.
- Gas emergency `0800 111 999` and `early-access@maintenanceos.co.uk` stay.
- `node --test scripts/help-phantom-hosts.test.mjs scripts/help-support-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/help-price-honesty.test.mjs scripts/font-preload.test.mjs` exits 0.
