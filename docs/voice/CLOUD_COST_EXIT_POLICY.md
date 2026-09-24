# MaintenanceOS Voice — Mandatory Cloud Cost Exit Policy

Status: ACTIVE OWNER DIRECTIVE
Applies to: MaintenanceOS voice commissioning and final production architecture.

## Required end state

MaintenanceOS must not retain temporary cloud infrastructure merely because it was useful during commissioning.

Target architecture:

1. ONE right-sized 24/7 cloud MaintenanceOS voice service for the live telephone lifeline.
2. Laptop/local compute for temporary and on-demand development, experiments, model testing, benchmarking, training/preparation and other non-24/7 workloads when technically suitable.
3. Snapshots/images and documented recovery procedure for rollback wherever a continuously running rollback VM is not genuinely required.
4. No duplicate voice infrastructure without a documented operational requirement.

## Current temporary infrastructure

At the 2026-09-24 commissioning checkpoint:

- 602169737 — maintenanceos-production-voice — $12/month class — preserve during commissioning.
- 601962983 — maintenanceos-production-voice-rollback — $12/month class — candidate for removal after snapshot/recovery proof.
- 602509753 — maintenanceos-local-voice-canary-temp — $48/month class — temporary isolated commissioning resource; candidate for removal after candidate acceptance and local/laptop replacement assessment.

Current combined plan cost class: approximately $72/month before snapshot charges or other account costs.

## Mandatory exit gates

MaintenanceOS commissioning MUST NOT be declared complete until all of the following have been addressed:

A. Prove the final live voice service can operate safely on the selected cloud host with acceptable real-call latency and capacity.

B. Benchmark/verify which development and test workloads can safely run on the owner's laptop/local compute. Temporary cloud compute must justify why it cannot be local before being retained.

C. Prove rollback from retained snapshot/image and document the recovery procedure.

D. Check the rollback droplet for unique data, secrets, identity, networking, dependencies, or state. If none require it to remain running and recovery proof passes, remove the running rollback droplet.

E. Check the temporary canary for unique data/evidence needed for production or audit. Preserve required artifacts. Once isolated cloud commissioning is complete and the final production path is proven, remove the temporary canary unless a documented 24/7 requirement exists.

F. Re-audit DigitalOcean after cleanup and record the final recurring cost.

## Safety rule

DO NOT delete or consolidate a droplet merely to reduce cost while it is still protecting the live phone service or contains an unverified unique dependency.

Sequence:
PROVE -> PRESERVE -> MIGRATE/CONSOLIDATE -> VERIFY -> DELETE REDUNDANCY -> VERIFY AGAIN.

The live telephone lifeline remains cloud-hosted and must not depend on the owner's laptop being powered on or connected.

## Agent rule

Every agent working on MaintenanceOS voice must treat this file as a commissioning requirement. A temporary cloud resource is not automatically permanent architecture.

If a temporary resource remains at final commissioning, the completion report must state:
- why it is still required;
- why laptop/local compute or snapshots cannot replace it;
- its monthly cost;
- the evidence supporting retention.

Absent that evidence, it is cleanup debt and MaintenanceOS is not fully commissioned.
