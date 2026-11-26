# Why the Stack is Broken (each broken link in one plain sentence)

1. OpenCode JSON has ONE provider "omniroute" at 20140 - NO gemini, codex, cursor, or local-dell-llama providers registered
2. OmniRoute primary (20128) returns 401 without estate key - codex/gemini/cursor have no API keys configured
3. OmniRoute-B (20131) returns 401 without estate key - same issue as primary
4. Local Llama (Qwen on 127.0.0.1:8081) is healthy but NOT registered in OmniRoute's model registry
5. Mac lane has gpt-oss-120b locally but is NOT behind OmniRoute - separate stack with no shared skills/AGENTS.md
6. Codex CLI NOT installed on PATH - only ~/.codex dir exists
7. Gemini CLI NOT installed on PATH
8. Cursor CLI NOT installed on PATH
9. Fallback proxy port 20130 has NO caller - upstreams include omni-tunnel disabled (20129), likely dead
10. Omni-tunnel to 64.227.40.86 disabled tonight - breaks any former routing through that path
11. opencode.json model LIMITS include local-dell-llama:8 but the model is never registered in the upstream OmniRoute containers
12. openrouter/openai/gpt-oss-120b route has CREDITS EXHAUSTED - every cycle failing, no candidate healthy
13. cfp/openai/gpt-oss-120b frequently probed unhealthy - model cap 8 but capacity insufficient
14. mistral/codestral-latest frequently probed unhealthy - cap 8, capacity insufficient
15. groq/openai/gpt-oss-120b sometimes healthy but low priority after openrouter credits lost
16. Mac LMStudio Relay (11234) is the only healthy downstream but only 4 concurrent spills allowed
17. estate-coding primary model often rerouted to free-only/openrouter due to 429 storms, not due to auth failures
18. Per-model semaphores (estate-coding:32, groq:8, etc) cause cascading 429s when cross-model traffic spikes
19. Opencode built-in models (~53 total) are all remote via opencode.ai API - no local inference on Dell GPU
20. Mac Studio opencode.json + openclaw.json reference only local gpt-oss-120b/20b - NO omniroute connection
21. Front proxy injects estate OMNIROUTE_API_KEY from chapelgate-watchman.env - without it all upstreams 401
22. model-failrate runs show estate-coding clean-exit rate under 80% on 21:05/22:05 runs - cap would drop to 8
23. hy4-flash-free has been hung 54/54 cycles - off rotation, affects product lanes
24. deepseek-v4.1-flash-free excluded from merge-gate reviews - not available for council
25. free-only model cap 16 but frequently unhealthy - overflow traffic congests estate-coding path
26. Council review families use opencode/deepseek-v4.1-flash-free and opencode/qwen4-max-free - estate-coding capped at 12
27. estate-coding cap at 12 but rerouted on 429 spikes - effective concurrency often lower
28. Rate-reroute log shows constant 429 spikes - nvidia/nemotron/gemini models all congested simultaneously
29. Probe checks: free-only, cfp/openai/gpt-oss-120b, openrouter/openai/gpt-oss-120b frequently report not healthy
30. One shared AGENTS.md/skills across all models does NOT exist - each model queue is separate