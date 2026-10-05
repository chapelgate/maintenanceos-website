# LUMI Benchmark V2 — Evidence Review

Date: 2026-10-05
Proposal: EHPC-AIF-2026PG01-1300
Scope: MaintenanceOS family

## Evidence board

This is a virtual evidence review. The named experts were not personally retained; the design is grounded in their published methods and real LUMI projects.

- Christian Schou Oxvig, senior specialist HPC & AI/ML, DeiC/LUMI user support: LUMI AI containers, batch jobs and scaling.
- Irene Livia Kruse, Eleni Briola and Simon Kamuk Christiansen, Danish Meteorological Institute: 5,000 GPU-hour LUMI programme; single-GPU profiling followed by 1→8 GPU scaling and batching improvements.
- Oguzhan Gencoglu, co-founder & Head of AI, Root Signals/Scorable: LUMI-based LLM reliability evaluation using large open and synthetic evaluation workloads and quantisation.
- Jan Tyl, founder/CEO, Alpha Industries: 5,000 GPU-hour LUMI evaluation project; showed that bulk evaluation is the useful HPC pattern and that model size should be chosen from measured failure behaviour.
- NIST ARIA authors: model testing + red teaming + field/user testing.
- MLCommons AILuminate: hazard taxonomy, disjoint practice/hidden sets, evaluator calibration and benchmark-integrity controls.

Sources:
- https://docs.lumi-supercomputer.eu/runjobs/lumi_env/billing/
- https://docs.lumi-supercomputer.eu/runjobs/scheduled-jobs/partitions/
- https://docs.lumi-supercomputer.eu/runjobs/scheduled-jobs/throughput/
- https://docs.lumi-supercomputer.eu/laif/software/ai-environment/
- https://lumi-supercomputer.eu/czechias-alpha-industries/
- https://lumi-supercomputer.eu/root-signals/
- https://lumi-supercomputer.eu/improving-weather-forecasts/
- https://www.nist.gov/publications/aria-evaluation-planning-manual-elements-aria-style-ai-evaluations
- https://mlcommons.org/ailuminate/safety-methodology/

## Decision

Keep the existing 5,000 GPU-hour phase envelope. Improve the experimental design inside it. The allocation is a ceiling, not a target to consume.

## Non-negotiable benchmark rules

1. A system-under-test is the complete fixed model + prompt + routing + guardrails + tools + settings.
2. Compare systems on paired cases.
3. No template inflation: changing only a reference number, name, postcode, case ID or cosmetic wording does not create independent evidence.
4. Development and hidden-final sets are disjoint by scenario family, not merely text.
5. Deterministic controls remain authoritative.
6. Use deterministic scoring wherever possible; use model judges only for nuanced text and calibrate them against human-labelled examples.
7. Repeat identical prompts only to measure finalist variance.
8. CPU-only logic, deployment and stale branches consume zero GPU hours.
9. Every material run records Git SHA, model/config digest, corpus digest, Slurm job ID, partition, runtime and allocation delta.

## Corpus design

Build 24,000 unique scenario threads: 12,000 development + 12,000 hidden-final.

Coverage:
- critical property hazards and emergency lookalikes;
- routine maintenance and mixed-fault reports;
- ambiguity, missing facts, contradictions and story changes;
- prompt manipulation and role confusion;
- action-integrity checks: no invented booking, dispatch, payment, refund, compensation or completion;
- privacy, tenant isolation and identity uncertainty;
- ReceptionOS multi-turn correction, interruption, silence, readback, fallback and transfer boundaries;
- realistic transcript corruption;
- LandlordOS, LettingAgentOS, PropertyManagerOS, MaintenanceOS, HousingAssociationOS, FacilitiesOS, CouncilOS and HolidayLetOS as context strata of the same shared intelligence.

Every accepted case gets a structured substantive signature. Two cases with the same complete substantive signature cannot both count as independent evidence.

The hidden-final set must contain at least 3,000 independent critical-safety cases. If a finalist has zero misses across 3,000 independent cases, the rule-of-three gives an approximate 95% upper bound of 0.1% within the tested population. This is evidence, not a production safety guarantee.

## GPU execution

- <=150 GPUh shakedown/profiling: one GCD, batch-size profiling, memory and cost per case.
- <=500 GPUh baselines: immutable current main + selected credible open-weight candidates.
- <=1,600 GPUh model/config tournament: successive halving; weak systems stop early.
- <=1,300 GPUh robustness: unique failure families, not copies.
- <=700 GPUh efficiency: batching, context, quantisation, vLLM where supported, then 1→2→4→8 GCD scaling only if cost per case improves.
- <=500 GPUh finalists: hidden-final run and limited repeats for variance.
- <=250 GPUh contingency: real failures only.

Use small-g while partial-node allocation is cheaper. Move to standard-g only when measured whole-node throughput reduces GPU-hours per completed scenario. Use Slurm arrays for independent shards and larger JSONL/Parquet shards rather than thousands of tiny files.

## Promotion gates

Do not promote a candidate with:
- a critical emergency miss;
- deterministic safety bypass;
- cross-tenant/private-data exposure;
- an unsupported operational claim;
- material regression in required-information extraction;
- benchmark contamination.

Select on the Pareto frontier: safety first, then utility, then GPU cost/latency.

## Final validation

LUMI covers model testing and red teaming. Per NIST ARIA, final production claims still require controlled field/user testing outside the GPU campaign.

Stop or redirect a phase when confidence is sufficient, no new failure families are emerging, or another candidate dominates it. Never spend GPU hours merely to use the allocation.
