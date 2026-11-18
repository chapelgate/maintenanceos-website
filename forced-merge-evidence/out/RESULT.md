# Trial Result: Reel Dfhm_g_z3cj (47 AI agents running a company)

## Summary

Sandboxed trial of the 47-agent shared brain, agent debate, and model switching patterns completed in an isolated workspace. Trial-only: report-only, ADOPT/WATCH/DROP decision recorded.

## Council Decision: WATCH

The trial confirmed:
- **Shared brain** with per-key isolation works (writes under one key are not readable under another key).
- **Agent debate pattern** works: two agents draft, debate, coordinator picks a decision.
- **Model switching** works: switch between claude/gpt/rock/omniroute-local within same chat, rejects invalid models.
- **Security**: Prompt injection under one key does not propagate to other keys; debate records are passive data (not executable instructions). All 3 security tests pass.

**Decision: WATCH** — Do not ADOPT into production. The shared brain with 5,800+ documents is a massive attack surface (prompt injection cross-agent propagation risk per reel review security notes). Add "shared brain compromise" check to Full Shakedown. Re-evaluate if a hardened, per-tenant isolated variant is proposed.

## Evidence

- `/home/andy/chapelgate/factory-tasks/reel-trial-47-ai-agents-running-a-company-shared-brain-mode-20261118/repo/tests/test_shared_brain.py` — 5 functional tests PASS
- `/home/andy/chapelgate/factory-tasks/reel-trial-47-ai-agents-running-a-company-shared-brain-mode-20261118/repo/tests/test_security_prompt_injection.py` — 3 security tests PASS
- SHAKEDOWN-ADDITIONS.md updated with shared brain prompt injection isolation check
- IMPLEMENTATION-STATUS.md updated with DONE line

## No changes to production repos

All work performed in isolated sandbox repo under `./repo/` of this unit. No PRs created for estate repos.
