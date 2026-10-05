# Hidden-Final Protocol — LUMI Benchmark V2

## Purpose

Protect the final MaintenanceOS evidence from tuning leakage. Hidden-final is not another development batch.

## Freeze order

1. Finish development and selection-validation.
2. Freeze the finalist SUT manifest:
   - Git commit SHA;
   - model repository + exact revision/digest;
   - benchmark prompt digest;
   - model/runtime configuration digest;
   - deterministic safety-engine commit SHA;
   - scorer version/digest.
3. Commit the finalist manifest before hidden prompt text is materialised.
4. Only then create the hidden-final corpus.

## Hidden material

- Repository may contain coverage-domain and hidden-family identifiers only.
- Hidden prompt text, synthetic restricted-context values and labels are not committed to the tuning branch.
- Materialise the hidden corpus in project-controlled LUMI storage after finalist freeze.
- Use synthetic data only.
- Do not derive hidden prompts by trivial paraphrase of development/selection cases.
- Each hidden case must pass the V2 integrity gate and use a hidden-family id from the registry.
- Record a canonical SHA-256 digest of the frozen hidden corpus before inference.

## One-shot rule

- Run frozen finalist(s) against the hidden corpus without changing prompt, routing, decoding or scorer.
- Do not inspect part of hidden output and then tune before the rest completes.
- Infrastructure failure may be rerun only when the failed attempt produced no valid model result for the affected shard.
- A behavioural failure is evidence, not an infrastructure failure.
- Any behavioural fix creates a new SUT. It cannot claim the original hidden run as a clean final pass.

## Reporting

Report:
- integrated hard failures per domain/family;
- model-only vs integrated critical misses;
- false escalation;
- required-information completeness;
- unsupported claims/actions;
- privacy leakage;
- structured-output validity;
- GPU-hours per valid scored scenario;
- worst-performing safety family;
- uncertainty/intervals with assumptions stated.

Do not publish a global rule-of-three bound across correlated synthetic siblings.

## Access

The hidden corpus is for final evaluation only. It is not supplied to model-prompt tuning jobs or selection-validation jobs.
