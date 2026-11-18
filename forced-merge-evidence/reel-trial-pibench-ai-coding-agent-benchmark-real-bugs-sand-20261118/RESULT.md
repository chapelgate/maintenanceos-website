# Reel DfgsRBMyb5a — PiBench Trial Result

**Verdict:** DROP

**Date:** 2026-11-18

## Summary

PiBench (inclusionAI/PIBench) is an Alipay payment-integration benchmark for AI coding agents. It requires:

- Docker Engine with daemon access for per-task container orchestration
- Model provider API keys (agent and judge endpoints)
- External network access to Docker registries and package repositories
- Alipay sandbox credentials for task runtime inputs

## Trial Attempt

Attempted `./run.sh --init`, `./run.sh --dry-run`, and `./run.sh --doctor` on `/tmp/pibench`.

- `--dry-run` succeeded: listed 18 task instances across Basic/Advanced scenarios.
- `--doctor` failed: `agent.model` missing, `judge.base_url`/`judge.model`/`judge.api_key_env` missing, and 9 task instances require unconfigured `alipay_sandbox` runtime input.

## Reason for DROP

PiBench cannot execute in the estate sandboxed environment because:

1. **Docker daemon access** — estate runs containers but the sandboxed trial environment does not have Docker daemon access for per-task image builds.
2. **No model API keys** — estate rules prohibit creating accounts/secrets; OmniRoute loopback (`127.0.0.1:20128`) is not a model provider endpoint that PiBench's agent/judge adapters can target without API key configuration.
3. **No external network** — PiBench requires network access to Docker registries and task-specific package repositories; estate rules prohibit outbound network access except OmniRoute.
4. **No Alipay sandbox credentials** — task runtime inputs require unconfigured `alipay_sandbox`.

## Recommendation

PiBench is report-only: no estate code changes, no PRs, no infrastructure additions. Re-evaluate if estate gains Docker-enabled sandboxed benchmark execution with local model serving (e.g., OmniRoute loopback as model endpoint).

**Area mapping:** PentAGI, Full Shakedown, llm-evaluation, local model eval — all noted as unable to execute PiBench in current estate sandbox.

## Evidence

- Repo cloned to `/tmp/pibench` (read-only trial)
- `run.sh --dry-run` output: 18 task instances listed
- `run.sh --doctor` output: configuration failures (agent/judge model keys missing, alipay_sandbox runtime input missing)
- Reel-DECISIONS.md row: reel DfgsRBMyb5a | TRIAL | PentAGI, Full Shakedown, llm-evaluation, local model eval
- ADOPTION-TRACKER.md line 28: status "in progress", result path set to this factory task out/RESULT.md
