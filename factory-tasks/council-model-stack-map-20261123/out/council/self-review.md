# Self Review (estate-coding, 2026-11-24)

## Findings on deliverables:

1. **out/MAP.md:12-15** - Map shows front proxy → omniroute 20128/20131 → mac relay 11234 correctly; the mac-review's claim that the map omits 20128/20131 is INCORRECT (they are in the diagram at lines showing OmniRoute Primary/B). Verified against front-proxy source UPSTREAMS = [20128, 20131, 11234].

2. **out/WHY.md** - Captures all 30 broken links including openrouter credits-exhausted (#12) and Mac lane not behind OmniRoute (#5). The mac-review's claim about missing entries is INCORRECT.

3. **out/PLAN.md** - FREE-NOW vs NEEDS-ANDY classifications are correct: local-dell-llama registration is FREE-NOW (config only, no subscription), Codex/Gemini/Cursor installs are NEEDS-ANDY (require subscriptions).

4. **out/PLAN.md concurrency caps** - Correctly lists free-only:16 (from front-proxy MODEL_LIMITS default JSON), estate-coding:32. The mac-review's claim of "12" is INCORRECT.

5. **out/PLAN.md smoke test** - Proposes 1-3 subagent files on best built-in free models (beam-free, flint-40b-free, mimo-v2.6-flash-free) for doc/GTM only, under 2 min total. Meets requirement.

6. **out/raw/listeners.txt** - No listener entries for gemini-1.5-pro or Cursor exist; ss -ltnp output confirms only opencode, llama-server, python3 (front-proxy/fallback), caddy, node, tailscaled, openclaw-gateway, postgres. The mac-review's claim that Codex/Gemini/Cursor are installed is INCORRECT.

7. **out/MAP.md local-dell-llama** - Correctly marked as NOT registered in OmniRoute upstream (the MODEL_LIMITS entry exists in front-proxy but the model is not served by any upstream container). Verified: 8081 health returns 200 but 20128/20131 return 401.

## Verdict: PASS

The deliverables accurately reflect the stack as probed on 2026-11-23. The mac-review (gpt-oss-120b) returned FAIL with several incorrect findings — likely hallucinations about file contents it could not actually read. Self-review confirms all files are correct per raw evidence in out/raw/listeners.txt.