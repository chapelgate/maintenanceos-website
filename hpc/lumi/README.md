# MaintenanceOS on LUMI-G

This is the controlled execution path for EuroHPC proposal `EHPC-AIF-2026PG01-1300`.

## Guardrails
- MaintenanceOS only.
- Synthetic benchmark data only unless a formally approved change exists.
- No live resident/customer personal data.
- Deterministic emergency controls and human escalation remain authoritative.
- Do not claim EuroHPC certification.

## Preflight
Run on LUMI after onboarding:

```bash
lumi-allocations
export LUMI_ACCOUNT=project_<id>
python3 scripts/eurohpc/lumi_usage_snapshot.py --label before-smoke
python3 scripts/eurohpc/validate_scaffold.py
```

`lumi-allocations` must show the awarded project before submission.

## Smoke test
```bash
sbatch --account="$LUMI_ACCOUNT" hpc/lumi/smoke_test.slurm
```

The smoke job requests one GCD on `small-g` for at most 10 minutes, validates the published LUMI AI Factory PyTorch container can see an accelerator, and writes `artifacts/eurohpc/smoke-<jobid>.pass` only on success.

After completion:

```bash
python3 scripts/eurohpc/lumi_usage_snapshot.py --label after-smoke --job-id <jobid>
```

Do not start benchmark work unless the PASS marker and allocation snapshots are retained, the allocation dates/restrictions are recorded, and the synthetic corpus is frozen/versioned.

## First benchmark
Only after those gates are satisfied:

```bash
export LUMI_ACTIVATION_OK=YES
export BENCHMARK_CMD='singularity run /appl/local/laifs/containers/lumi-multitorch-latest.sif python <entrypoint> --dataset <synthetic-pack> --output <result.json>'
sbatch --account="$LUMI_ACCOUNT" --export=ALL,BENCHMARK_CMD,LUMI_ACTIVATION_OK hpc/lumi/benchmark_job.slurm
```

Scale beyond one GCD only after measured throughput/quality evidence justifies it.

## Billing facts used by this scaffold
- `small-g` and `dev-g` are resource-allocatable GPU partitions.
- LUMI treats each MI250X as two GCDs for Slurm/HIP.
- On `small-g`/`dev-g`, billing is 0.5 GPU-hour per allocated GCD-hour.
- `standard-g` bills the full four-MI250X node, so it is intentionally not the starter path.

Official sources:
- https://docs.lumi-supercomputer.eu/runjobs/lumi_env/billing/
- https://docs.lumi-supercomputer.eu/runjobs/scheduled-jobs/partitions/
- https://docs.lumi-supercomputer.eu/laif/software/ai-environment/