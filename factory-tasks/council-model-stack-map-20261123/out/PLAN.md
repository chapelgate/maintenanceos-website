# Dell Model Stack Map - Plan (FREE-NOW / NEEDS-ANDY)

## Free (FREE-NOW) - Council can merge

1. **FREE-NOW**: Set OMNIROUTE_API_KEY in chapelgate-watchman.env and ensure all upstreams accept the estate key
   - Injects the estate API key into the front proxy, resolving 401 errors on all OmniRoute upstreams
   - No login/spend required; just env file configuration

2. **FREE-NOW**: Register local-dell-llama (Qwen) in OmniRoute model registry
   - Add "local-dell-llama" as a model name in the front-proxy's MODEL_LIMITS
   - Point it at llama-server 127.0.0.1:8081
   - No login/spend; just config change

3. **FREE-NOW**: Register mac-lmstudio-relay models in OmniRoute (already working via spill)
   - Mac LMStudio relay at 11234 already responds 200 OK with gpt-oss-120b + nomic-embed
   - Just needs model name mapping in the front-proxy's MODEL_LIMITS

4. **FREE-NOW**: Fix fallback proxy port 20130 caller configuration
   - Remove dead omni-tunnel reference (port 20129)
   - Set proper upstreams or de-register the dead fallback
   - Config only, no spend

5. **FREE-NOW**: Create shared AGENTS.md and skills across all model providers
   - Copy existing AGENTS.md to a shared location referenced by all model queues
   - Skills reuse (pentagi-security-testing, etc) already available
   - Coordination only, no login/spend

6. **FREE-NOW**: Opt-in subagent files on best built-in free models for doc/GTM review
   - Create 1-3 agent files pointing at opencode/beam-free, flint-40b-free, mimo-v2.6-flash-free
   - Under 2 min total prompt time each
   - Never security work, never merge-gate reviews
   - Opencode syntax confirmation needed (debug or docs for v1.19.5)

## Needs Andy (NEEDS-ANDY) - login/subscription/spend

7. **NEEDS-ANDY**: Install Codex CLI on PATH
   - Requires OpenAI subscription / API key login
   - Andy-only launch work (HB-001..010)
   - Free route: use opencode as proxy; do NOT install live Stripe/prod keys

8. **NEEDS-ANDY**: Install Gemini CLI on PATH
   - Requires Google AI Studio API key
   - Andy-only launch work condition
   - Free route: use opencode's remote Gemini access via opencode.ai API

9. **NEEDS-ANDY**: Install Cursor CLI on PATH
   - Requires Cursor subscription / login
   - Andy-only launch work condition
   - Free route: use opencode as proxy

10. **NEEDS-ANDY**: Add gemini/provider and cursor/provider to opencode.json
    - Register Gemini and Cursor as named providers in opencode.json
    - Subscription/spend may be required for API access
    - Andy-only launch work; keep separate from product

11. **NEEDS-ANDY**: Enable omni-tunnel to 64.227.40.86 (or approved replacement)
    - Restore the disabled tunnel that previously routed through 64.227.40.86
    - Requires network configuration and possibly subscription
    - Andy-only; keep separate from product HB items

12. **NEEDS-ANDY**: Increase model concurrency caps beyond current limits
    - current: estate-coding:32, free-only:16, others:8
    - May require API plan changes or subscription upgrades
    - Andy reviews only; product lanes stay on current caps

13. **NEEDS-ANDY**: Openrouter credits restoration (openrouter/openai/gpt-oss-120b)
    - Credits exhausted; every cycle failing
    - Requires payment or free tier registration
    - Andy-only; mark PARKED until credits restored

14. **NEEDS-ANDY**: Resolve model-failrate clean-exit rate under 80% threshold
    - estate-coding cap may drop from 12 to 8 if fail rate < 80% on 21:05/22:05 runs
    - Requires investigation of root cause (429 storms? auth issues?)
    - Andy decision needed on cap adjustment

15. **NEEDS-ANDY**: Mac lane full integration behind OmniRoute
    - Mac Studio needs opencode.json configured with omniroute provider
    - Requires mac-review.sh review and council approval
    - Andy-led; not auto-mergeable

## Council Review Actions (after self + mac-review.sh)

16. **FREE-NOW**: Run two reviews (self + mac-review.sh) in out/council/
    - Both reviews must pass before MISSION_COMPLETE
    - Review families: opencode/deepseek-v4.1-flash-free and opencode/qwen4-max-free
    - estate-coding is retry-only on councils

17. **FREE-NOW**: Write out/MISSION_COMPLETE (first line exactly PASS or BLOCKED: reason)
    - Cite only out/raw files for pass counts and SHA
    - Raw proof must exist for every claimed pass

## Free Routes Around NEEDS-ANDY Items

- **Free route around #7-9**: Use opencode as front door; all calls go through omniroute-front-proxy:20140 which can spill to Mac relay
- **Free route around #10**: opencode.json already has omniroute provider; add gemini/cursor as named combo models under a separate key (not omniroute)
- **Free route around #11**: Skip the disabled tunnel; use Mac LMStudio relay at 11234 as the free route instead
- **Free route around #12**: Work within current concurrency caps; the front-proxy adaptive throttle already downgrades to STORM_INFLIGHT=16 during 429 spikes
- **Free route around #13**: Mark openrouter route as PARKED; use cfp/openai/gpt-oss-120b or free-only as alternatives when healthy
- **Free route around #14**: Monitor model-failrate; if cap drops to 8, adjust workload to stay under new limit
- **Free route around #15**: Mac lane stays separate; use mac-review.sh for any council votes; no forced integration