# LUMI-G 30-Day Execution Plan

Proposal: EHPC-AIF-2026PG01-1300
Award: 5,000 GPU hours on LUMI-G
Duration: 1 month
Project: MaintenanceOS: Safety-Assured AI Triage for Property Maintenance

## Operating rules
- Use the allocation only for the approved MaintenanceOS project scope.
- Use synthetic data only unless an approved change is documented.
- Do not use live resident/customer personal data.
- Deterministic emergency controls and human escalation remain authoritative.
- Treat prototype test evidence as prototype evidence, not production certification.
- Keep all reproducible scripts, configs, results and reports in cloud source control/storage where appropriate; use the laptop only as a control terminal.

## Ten-step execution plan
1. Onboarding and access: complete EuroHPC/LUMI account creation, institutional email verification, terms acceptance, project membership, and SSH/federated access.
2. Technical assessment capture: archive the Technical Assessment and any LUMI restrictions/consumption pattern into project records.
3. Reproducible environment: define software stack, container/environment files, model versions, ROCm-compatible dependencies and deterministic seeds.
4. Synthetic benchmark pack: create a versioned corpus of normal, ambiguous, high-risk, contradictory and adversarial maintenance reports with expected classifications and escalation labels.
5. Baseline benchmark: run current MaintenanceOS logic and selected baseline AI models on the benchmark corpus; record accuracy, emergency misses, false escalations, latency and resource use.
6. Model/configuration sweep: systematically evaluate approved open models and configuration variants; prune weak candidates early.
7. Robustness/safety testing: stress top candidates with ambiguity, prompt injection, contradictory descriptions, missing details and rare-event safety cases.
8. Efficiency optimisation: compare batching, context length, quantisation and inference settings; identify best quality-per-GPU-hour configuration.
9. Repeatability/failure analysis: rerun finalists with fixed seeds/replicates, catalogue failure modes, confidence intervals and unresolved risks.
10. Final evidence pack: produce benchmark report, model/config recommendation, reproducibility instructions, limitations, GPU usage summary and EuroHPC final report inputs.

## Provisional GPU budget
- Environment shakedown and smoke tests: 150 GPUh
- Baselines: 500 GPUh
- Broad model/configuration sweep: 1,600 GPUh
- Robustness and safety stress tests: 1,300 GPUh
- Efficiency/quantisation/batching experiments: 700 GPUh
- Repeatability and finalist reruns: 500 GPUh
- Contingency for failed jobs / scheduler effects: 250 GPUh
Total: 5,000 GPUh

The budget is a planning ceiling, not a target to waste compute. Unnecessary runs should not be executed merely to consume allocation.

## 30-day cadence
Days 1-3: access, environment, dataset freeze, smoke tests.
Days 4-8: baselines.
Days 9-16: broad model/configuration sweep.
Days 17-22: robustness/safety testing.
Days 23-26: efficiency optimisation.
Days 27-28: finalist reruns and failure analysis.
Days 29-30: evidence pack and final-report preparation.

## Metrics
- Critical emergency miss rate
- False emergency escalation rate
- Correct job-category rate
- Required-information extraction accuracy
- Hallucination / unsupported-action rate
- Consistency across reruns
- Latency / throughput
- GPU hours per benchmark batch
- Failure cases requiring deterministic/human fallback

## Human-only blockers
- EuroHPC Peer-Review Technical Assessment login if interactive login/2FA is required.
- LUMI/EuroHPC account invitation, terms acceptance or identity confirmation.
- Any CAPTCHA/OTP/2FA.
- Acceptance of any consequential declaration not already evidenced.

## Do not do
- Do not divert allocation to Cheap Trips, Holiday Let Operator, CarFixAI or unrelated agent workloads.
- Do not claim EuroHPC has certified MaintenanceOS.
- Do not upload live customer/resident data.
