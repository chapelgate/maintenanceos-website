# Self Review Prompt: Dell Model Stack Map (2026-11-23)

Review the following deliverables for correctness, completeness, and evidence:

## Files to review:
1. out/raw/listeners.txt - listeners, model health, model registry
2. out/MAP.md - ASCII/mermaid map of who calls whom
3. out/WHY.md - broken links, one sentence each
4. out/PLAN.md - numbered fixes, FREE-NOW vs NEEDS-ANDY

## Questions to answer:
1. Does MAP.md accurately reflect the current stack (front proxy 20140 -> omniroute 20128/20131 -> mac relay 11234)?
2. Are all broken links captured in WHY.md?
3. Are FREE-NOW vs NEEDS-ANDY classifications correct?
4. Is the local-dell-llama (Qwen on 8081) correctly marked as NOT registered in OmniRoute?
5. Is the Mac lane correctly marked as NOT behind OmniRoute?
6. Are Codex/Gemini/Cursor correctly marked as NOT installed?
7. Does PLAN.md include a smoke test proposal for opencode built-ins (1 short prompt each, under 2 min total)?
8. Does PLAN.md propose 1-3 subagent files on best built-in free models for doc/GTM only?
9. Are the model concurrency caps correct (estate-coding:32, free-only:16, others:8)?
10. Is openrouter marked as credits-exhausted?

## Verdict format:
PASS or FAIL with file:line findings for any issues.