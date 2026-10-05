# LUMI Benchmark V2 — Independent Second Review

Date: 2026-10-05
Proposal: EHPC-AIF-2026PG01-1300
Review type: independent second-pass challenge review

## Reviewer basis

This is a virtual second-opinion review grounded in published work and real-world evaluation/HPC practice. It does not claim that the named people were directly retained.

Evidence base:
- NIST ARIA evaluation team — holistic application evaluation using model testing, red teaming and user/field testing.
- Stanford CRFM / HELM (including Percy Liang and HELM Capabilities authors) — curated scenario-based, transparent and reproducible model evaluation.
- MLCommons AILuminate AI Risk & Reliability working group — large public practice and hidden official sets, hazard taxonomies, evaluator calibration and benchmark-integrity rules.
- LiveBench authors — contamination-resistant evaluation and objective scoring where possible.
- DMI/EuroCC/LUMI case study — real 5,000 GPU-hour LUMI programme, profiling before 1→8 GPU scaling.
- Alpha Industries / Jan Tyl — real 5,000 GPU-hour LUMI evaluation project showing bulk evaluation is the productive HPC pattern.
- Root Signals / Oguzhan Gencoglu — real LUMI use for LLM reliability evaluation and quality control.
- LUMI User Support documentation — billing, small-g vs standard-g, Slurm arrays, AI Factory containers and filesystem guidance.

Primary searchable sources:
- https://www.nist.gov/publications/aria-evaluation-planning-manual-elements-aria-style-ai-evaluations
- https://www.nist.gov/publications/assessing-risks-and-impacts-ai-aria-pilot-evaluation-report
- https://mlcommons.org/ailuminate/safety-methodology/
- https://mlcommons.org/ailuminate/safety-faq/
- https://crfm.stanford.edu/helm/
- https://crfm.stanford.edu/2025/03/20/helm-capabilities.html
- https://arxiv.org/abs/2406.19314
- https://lumi-supercomputer.eu/improving-weather-forecasts/
- https://lumi-supercomputer.eu/czechias-alpha-industries/
- https://lumi-supercomputer.eu/root-signals/
- https://docs.lumi-supercomputer.eu/runjobs/lumi_env/billing/
- https://docs.lumi-supercomputer.eu/runjobs/scheduled-jobs/throughput/
- https://docs.lumi-supercomputer.eu/laif/software/ai-environment/
- https://docs.lumi-supercomputer.eu/storage/

## Overall verdict

The V2 plan is fundamentally strong and should NOT be redesigned wholesale.

Keep:
- the existing 5,000 GPU-hour phase ceilings;
- small-g-first profiling and measured scaling;
- paired cases across systems-under-test;
- successive halving;
- hidden-final evaluation;
- deterministic safety/side-effect gates;
- ReceptionOS as a shared layer;
- eight OS products as context strata, not eight model stacks;
- selective reuse of old branch assets rather than wholesale merge;
- zero tolerance for identifier-only duplicate evidence.

The second review found four changes worth making because they materially reduce benchmark gaming, statistical overclaiming or wasted GPU time.

## Change 1 — Do not force exactly 24,000 cases

The earlier plan copied the scale of MLCommons AILuminate too literally.

AILuminate's 12,000 practice + 12,000 hidden official prompts are designed for twelve general-purpose hazard categories and primarily single-turn chat. MaintenanceOS is narrower in domain but deeper in workflow, multi-turn state, tool/action integrity and industry context.

Decision:
- keep 24,000 as the total ceiling/aspiration;
- use 8,000 development + 4,000 selection-validation + 12,000 hidden-final as planning targets;
- never manufacture filler to hit those counts;
- stop corpus expansion when coverage is complete and new scenarios cease discovering materially new failure mechanisms.

This preserves large-scale evidence without recreating the reference-number inflation problem.

## Change 2 — Add a three-way split

A two-way development/hidden split protects the final set, but repeated tournament decisions on one development set can still overfit model/prompt/router selection.

Decision:
- development: tune prompts/configurations and diagnose failures;
- selection-validation: make tournament/halving decisions after tuning;
- hidden-final: one-shot evaluation only after finalists are frozen.

Scenario families must remain disjoint across all three splits, not just exact prompt text.

## Change 3 — Correct the rare-failure statistics

The earlier plan used the rule-of-three example: zero critical misses across 3,000 cases implies an approximate 0.1% upper 95% bound.

That approximation is only defensible when observations behave like independent Bernoulli trials. Synthetic siblings from the same generator/failure family are correlated even if their text/signatures differ.

Decision:
- keep at least 3,000 hidden critical cases as a useful stress target;
- never present one global 3/n claim across correlated scenario families;
- report failure rates and uncertainty per hazard/failure family;
- state independence assumptions explicitly;
- use the rule-of-three only for truly independent zero-event strata;
- when failures occur, use proper binomial/Bayesian/Wilson-style intervals rather than a zero-event shortcut;
- always publish worst-performing critical family alongside the aggregate.

This avoids false confidence from a large but correlated synthetic corpus.

## Change 4 — Make selection statistically paired and cost-aware

All credible SUTs see the same cases. Decisions should therefore exploit the pairing rather than comparing only independent averages.

Decision:
- keep per-case paired outcomes;
- define practical non-inferiority/superiority margins before the tournament;
- eliminate a candidate when it is unsafe or clearly dominated on paired quality + GPU cost;
- do not spend more GPU time to resolve negligible differences that do not affect the commercial decision;
- optimise GPU-hours per VALID SCORED scenario, not raw throughput.

This makes successive halving more rigorous and prevents wasting hours chasing tiny leaderboard-style score differences.

## Evaluator policy

Hard gates must be deterministic:
- critical escalation;
- privacy/tenant isolation;
- permitted/forbidden side effects;
- unsupported booking/dispatch/payment/refund/compensation/completion claims.

A model judge may only score nuanced conversation quality after calibration against a human-adjudicated gold subset. Its errors/disagreements must be measured. A model judge cannot override a deterministic hard gate.

## GPU-use conclusion

No change is recommended to the phase budget:
- <=150 GPUh shakedown/profiling
- <=500 GPUh baselines
- <=1,600 GPUh model/config tournament
- <=1,300 GPUh robustness/safety
- <=700 GPUh efficiency
- <=500 GPUh finalists/repeatability
- <=250 GPUh contingency

These remain ceilings, not spending targets.

Use small-g until measured cost per valid scenario shows that a whole standard-g node is more efficient. Use bounded Slurm arrays for independent shards. Avoid large numbers of tiny files and direct Conda/pip environments on Lustre.

## Final second-opinion verdict

GO, with the four changes above.

Everything else in V2 survives the second review. The plan does not need architectural churn. The right improvement is tighter experimental discipline, not more infrastructure or more GPU consumption.
