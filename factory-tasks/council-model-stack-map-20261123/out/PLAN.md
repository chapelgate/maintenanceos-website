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

6. **FREE-NOW**: Opt-in subagent files on the best smoke-tested OpenCode built-in free models for doc/GTM review only
    - Do this only after a short read-only smoke test (one prompt each, under 2 minutes total); skip `hy4-flash-free` (hung 54/54) and keep `deepseek-v4.1-flash-free` out of merge-gate reviews
    - Confirm v1.19.5 accepts the `~/.config/opencode/agents/<name>.md` `mode: subagent` + `model:` syntax before writing agent files
    - Never security work, never merge-gate reviews; jobs opt in explicitly

### Stalled-build failover plan (Andy 00:47 direction, council decides exact config; no container recreate)

6a. **FREE-NOW, top priority**: make `estate-coding` walk down its rungs instead of returning a terminal 429 to OpenCode.
    - Measured defect: 459 build requests since 00:12 had up to 15 attempts each, all nvidia-only, with 20 final "all targets were skipped" clients and gemini/groq/lm-studio rungs never reached during storms.
    - Fix candidates in combo config only: continuous failover on 429/cooling, reject `maxRetries 0` terminal handling, keep a DB backup, apply on both routers, then verify one live request per changed rung.

6b. **FREE-NOW**: stop every incoming build from starting at rank 1 and queueing on the same cooling nvidia rung.
    - Prefer first-free/non-cooling selection, or least-busy/round-robin among equal-ranked rungs, so no free lane sits idle while work waits.
    - Cap-stepper ceiling stays administratively capped; free NVIDIA guidance is "up to 40 RPM for most models", and per-account vs per-model remains unverified.

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

10. **FREE-NOW**: Treat Gemini, Codex, Cursor, NVIDIA, Groq, OpenRouter and LM Studio as OmniRoute connections/combo rungs, not as separate OpenCode providers
     - Verified 24 Nov: those providers already exist inside OmniRoute; the CLI tools merely are not installed on PATH
     - Free route: keep OpenCode pointed only at OmniRoute; do not duplicate router auth in OpenCode

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

15. **FREE-NOW**: Treat Mac lane as wired through the Dell LM Studio relay, and remove/repair stale Mac rungs
     - Verified 24 Nov: OmniRoute connection `mac-studio-lmstudio` baseUrl `http://172.17.0.1:11234/v1` returns 200, and `lm-studio/gpt-oss-120b` returns 200 in 422ms
     - Broken `mac-studio/gpt-oss-120b` rung was removed because it returned 401 `provider_not_configured`; keep that removal and do not re-add it
     - Mac build traffic is nearly zero because capability ranking places gpt-oss-120b mid-list; decide whether that is intentional
     - Free route: use `lm-studio/gpt-oss-120b`; mac-review.sh remains the second review family

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
- **Free route around #10**: those providers already exist in OmniRoute; expose them by combo/connection only, with no new keys in OpenCode
- **Free route around #11**: Skip the disabled tunnel; use Mac LMStudio relay at 11234 as the free route instead
- **Free route around #12**: Work within current concurrency caps; the front-proxy adaptive throttle already downgrades to STORM_INFLIGHT=16 during 429 spikes
- **Free route around #13**: Mark openrouter route as PARKED; use cfp/openai/gpt-oss-120b or free-only as alternatives when healthy
- **Free route around #14**: Monitor model-failrate; if cap drops to 8, adjust workload to stay under new limit
- **Free route around #15**: use the live `lm-studio/gpt-oss-120b` relay rung; use mac-review.sh for second-family reviews; do not force Mac Studio to run the OmniRoute provider config