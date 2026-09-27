# LUMI-G 5,000 GPU-hour implementation status

Proposal: EHPC-AIF-2026PG01-1300  
Resource: LUMI-G  
Award: 5,000 GPU hours / one month  
Project: MaintenanceOS

## Repository implementation
- 30-day execution plan and bounded phase budget.
- LUMI-G low-cost smoke-test Slurm job on `small-g`.
- One-GCD benchmark starter job on `small-g`.
- Usage/evidence snapshot helper using `lumi-allocations` and `sacct`.
- Offline scaffold validator.
- Explicit problem log and separate human-blocker register.
- Synthetic-data-only and MaintenanceOS-only guardrails.

## Current activation state
PREPARED, NOT YET EXECUTED ON LUMI.

No material benchmark may start until all of these are evidenced:
1. EuroHPC/LUMI onboarding complete.
2. Real `project_<id>` account visible in `lumi-allocations`.
3. Allocation start/end dates recorded.
4. Technical Assessment/restrictions captured.
5. Smoke test completes and writes a PASS marker.
6. Synthetic benchmark corpus is versioned/hashed.

## First live action
Run only the 10-minute, one-GCD smoke test. On `small-g`, one GCD-hour is billed as 0.5 GPU-hour under LUMI's published billing policy, so the requested 10-minute smoke allocation is approximately 0.083 GPU-hour if it runs for the full walltime.

## Official references
- https://docs.lumi-supercomputer.eu/runjobs/lumi_env/billing/
- https://docs.lumi-supercomputer.eu/runjobs/scheduled-jobs/partitions/
- https://docs.lumi-supercomputer.eu/runjobs/scheduled-jobs/slurm-quickstart/
- https://docs.lumi-supercomputer.eu/laif/software/ai-environment/

Do not claim EuroHPC certification or upload live customer/resident data.