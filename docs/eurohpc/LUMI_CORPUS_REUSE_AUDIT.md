# LUMI Benchmark V2 — Existing Asset Reuse Audit

Date: 2026-10-05

## Rule

REMOVE/REUSE BEFORE ADD. Do not merge heavily diverged research branches wholesale. Extract only scenario concepts and fixtures that materially improve the frozen benchmark.

## Useful existing assets

### Current main
- `tests/red_team_corpus.json`: 520 rows, but 420 critical rows are template-heavy repeats. Keep category coverage only; do not count reference-number variants as independent evidence.
- `tests/test_acceptance_local.py`: strong deterministic acceptance cases for critical-state latching, human-only safety clearance, duplicate actions, cross-tenant protection and prompt injection. These remain CPU gates and oracle definitions.
- `TEST_CALL_RUNBOOK.md`: live-call evidence boundaries and known limitations. Use as field-test contract, not GPU benchmark evidence.
- `hpc/lumi/benchmark_job.slurm`: bounded benchmark wrapper with activation guard. Reuse.

### Diverged research branches worth selective backport

`cursor/lab-synthetic-expand-e283`
- concurrent call isolation
- multi-intent prioritisation
- provider failure
- abandoned call
- language-switch families

`cursor/lab-multilingual-expand-e283`
- interruption and locale-switch cases
- outage composition
- richer synthetic lab ideas

`cursor/red-team-gate-pack-e283`
- explicit red-team attack-class mapping
- fail-closed release-gate concepts

`cursor/regulated-eval-e283`
- synthetic-only regulated evaluation patterns
- confidential-data refusal pattern

`cursor/quality-lab-score-e283`
- outcome-vs-conversation-quality separation
- wrong-job, intent, action, safety and false-claim scoring concepts

`cursor/shadow-lab-runner-e283`
- offline synthetic runner and quality scoring concepts

## Reuse decision

Do not bring across branch infrastructure, ownership machinery or live-provider wiring.

Backport only:
1. scenario family definitions;
2. stable pure scoring functions if they survive current-main tests;
3. corpus schema fields;
4. offline-only test fixtures;
5. fail-closed invariants.

Reject:
- branch-specific control planes;
- duplicate queues/runners;
- live Twilio/Gemini traffic;
- branch histories with large unrelated divergence;
- any fixture whose only novelty is a changed identifier.

## Required next slice

1. Define the V2 scenario schema.
2. Map each useful old scenario family into that schema.
3. Remove duplicate/template-inflated rows from the candidate evidence set.
4. Create a small hand-reviewed seed set first.
5. Validate seed diversity and scoring before expanding to 24,000 unique threads.
6. Freeze development/hidden-family split before any model tuning.
