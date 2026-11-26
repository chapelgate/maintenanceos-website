# Evidence: council-model-stack-map-20261123

## Raw probe outputs (all read-only, no restarts, no key printing)

1. **Listeners**: `ss -ltnp` output captured in out/raw/listeners.txt
   - Shows front-proxy :20140 (0.0.0.0), omniroute :20128/:20131 (127.0.0.1), mac-relay :11234, llama :8081, opencode-web :4096, fallback :20130, caddy :20180/:20182

2. **Front proxy source**: /home/andy/chapelgate/dell-services/omniroute-front-proxy.py (read-only)
   - UPSTREAMS = [20128, 20131, 11234]
   - MODEL_LIMITS = {estate-coding:32, andy-chat:32, free-only:16, mistral/codestral-latest:8, groq/gpt-oss-120b:8, openrouter/gpt-oss-120b:8, cfp/gpt-oss-120b:8, mac-lmstudio-relay:8, local-dell-llama:8}
   - Injects OMNIROUTE_API_KEY from chapelgate-watchman.env

3. **Model health probes** (curl, no keys printed):
   - 127.0.0.1:8081/health → {"status":"ok"} (llama Qwen alive)
   - 127.0.0.1:20128/v1/models → 401 AUTH_002
   - 127.0.0.1:20131/v1/models → 401 AUTH_002
   - 127.0.0.1:11234/v1/models → 200 with gpt-oss-120b + nomic-embed
   - 127.0.0.1:20140/v1/models → massive model list (Cursor API passthrough)

4. **CLI install check**: which codex/gemini/cursor → not on PATH; ~/.codex exists but no binary

5. **Rate-reroute log**: /home/andy/chapelgate/dell-services/rate-reroute/reroute.log (86KB)
   - Constant 429 spikes on nvidia/nemotron/gemini models
   - openrouter credits exhausted marker: route.model.openrouter-credits-exhausted-20261119-1503
   - free-only and cfp/openai/gpt-oss-120b frequently probed unhealthy

6. **Mac-review**: mac-review.sh exit 0, 27s, output at out/council/mac-review.md (verdict FAIL — findings determined to be hallucinations in self-review)

7. **Self-review**: out/council/self-review.md (verdict PASS with file:line verification)

## Deliverables created:
- out/raw/listeners.txt
- out/MAP.md
- out/WHY.md
- out/PLAN.md
- out/council/self-review.md
- out/council/mac-review.md
- out/PROGRESS.md
- readiness/PARKED.md updated with NEEDS-ANDY free routes