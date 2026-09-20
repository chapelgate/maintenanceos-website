# Load test plan — concurrent voice

**Do not claim concurrent-call marketing numbers until this passes.**

## Goals

- Establish safe concurrency for sandbox and (later) production
- Find saturation (STT/TTS/LLM/provider) before customers do

## Phases

1. **Synthetic sessions** — N concurrent websocket/media sessions with canned audio
2. **Soak** — 30–60 min at target N
3. **Spike** — 2× N for 5 min
4. **Transfer path** — concurrent sessions that request human transfer

## Metrics

- Setup time p50/p95
- First audio latency
- Drop / error rate
- Cost per session-minute
- Provider rate-limit hits

## Gates

| Environment | Initial gate |
| --- | --- |
| Sandbox | Documented N with error rate < 1% |
| Production | Owner-approved N after freeze lifted |

Fonio public marketing cites high concurrency — treat as competitor marketing, not our SLA.
