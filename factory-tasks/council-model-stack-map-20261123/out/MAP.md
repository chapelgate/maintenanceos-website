# Dell Model Stack Map (2026-11-23)

## ASCII Call Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OPENCODE (Front Door)                               │
│  ~/.opencode/bin/opencode  →  opencode-web :4096                            │
│  opencode.json provider: "omniroute" → 127.0.0.1:20140                      │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   OMNIROUTE FRONT PROXY :20140 (0.0.0.0)                    │
│  /home/andy/chapelgate/dell-services/omniroute-front-proxy.py               │
│  Health-aware, per-model semaphores, mac-spill, adaptive throttle           │
│  Injects estate OMNIROUTE_API_KEY from chapelgate-watchman.env              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ OMNIROUTE PRIMARY │  │ OMNIROUTE-B      │  │ MAC LMSTUDIO     │
│ 127.0.0.1:20128   │  │ 127.0.0.1:20131  │  │ RELAY :11234     │
│ (docker)          │  │ (docker)         │  │ (python3)        │
│ Status: 401 Auth  │  │ Status: 401 Auth │  │ Status: 200 OK   │
│ Providers:        │  │ Providers:       │  │ Models:          │
│ - estate-coding   │  │ - estate-coding  │  │ - gpt-oss-120b   │
│ - free-only       │  │ - free-only      │  │ - nomic-embed    │
│ - groq/gpt-oss    │  │ - groq/gpt-oss   │  │                  │
│ - openrouter/gpt  │  │ - openrouter/gpt │  │ Mac-spill target │
│ - cfp/gpt-oss     │  │ - cfp/gpt-oss    │  │ when all 429     │
│ - mistral/codestral│ │ - mistral/codestral│                  │
│ - local-dell-llama│  │ - local-dell-llama│                 │
└──────────────────┘  └──────────────────┘  └──────────────────┘
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
         ┌──────────────────┐        ┌──────────────────┐
         │ OMNIROUTE        │        │ LOCAL LLAMA      │
         │ FALLBACK :20130  │        │ 127.0.0.1:8081   │
         │ (python3)        │        │ (llama-server)   │
         │ Upstreams:       │        │ Status: 200 OK   │
         │ - 20128          │        │ Model: Qwen      │
         │ - 20129 (tunnel) │        │                  │
         │ - 11234          │        │ NOT wired to     │
         │ DEAD (no caller) │        │ OmniRoute        │
         └──────────────────┘        └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        MAC LANE (Separate Stack)                            │
│  Mac Studio: opencode.json + openclaw.json                                  │
│  Only local gpt-oss-120b/20b, NO OmniRoute                                  │
│  keepalive queue + mac-review.sh                                            │
│  Not behind OmniRoute, no shared skills/AGENTS.md                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        OPCODE BUILT-IN MODELS (Remote)                      │
│  ~/.config/opencode/models.json → provider OpenCode                         │
│  api https://opencode.ai/inference/openai/v1                                │
│  ~53 free models (10 in opencode models list):                              │
│  - opencode/beam-free, big-pickle, deepseek-v4.1-flash-free,               │
│    flint-40b-free, hy4-flash-free (HUNG), iceman-free,                     │
│    mimo-v2.6-flash-free, nemotron-3.5-lightning-free,                      │
│    nemotron-3.5-super-vl-free, tidepool-alpha-free                         │
│  NOT local, third-party dependency, remote inference                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        MISSING / NOT WIRED                                  │
│  ✗ Codex CLI: NOT installed on PATH (~/.codex dir exists only)             │
│  ✗ Gemini CLI: NOT installed on PATH                                        │
│  ✗ Cursor CLI: NOT installed on PATH                                        │
│  ✗ Local llama: NOT registered in OmniRoute (model exists but not routed)  │
│  ✗ Mac lane: NOT behind OmniRoute                                           │
│  ✗ Fallback proxy :20130: DEAD - no caller, upstreams include disabled     │
│    tunnel (20129)                                                           │
│  ✗ opencode.json has ONE provider "omniroute" - no gemini/codex/cursor     │
│    providers registered                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Mermaid Diagram

```mermaid
flowchart TB
    subgraph OpenCode
        OC[OpenCode CLI] --> OW[opencode-web :4096]
        OC --> OP[opencode.json provider: omniroute]
    end
    
    OP --> FP[Front Proxy :20140]
    
    subgraph "OmniRoute Upstreams"
        FP -->|1st| OP1[OmniRoute Primary :20128]
        FP -->|2nd| OP2[OmniRoute-B :20131]
        FP -->|3rd/spill| MLR[Mac LMStudio Relay :11234]
    end
    
    subgraph "OmniRoute Providers (registered in front-proxy MODEL_LIMITS)"
        OP1 --> EC[estate-coding]
        OP1 --> FO[free-only]
        OP1 --> GROQ[groq/gpt-oss-120b]
        OP1 --> OR[openrouter/gpt-oss-120b]
        OP1 --> CFP[cfp/gpt-oss-120b]
        OP1 --> MIST[mistral/codestral-latest]
        OP1 --> LDL[local-dell-llama]
        OP2 --> EC
        OP2 --> FO
        OP2 --> GROQ
        OP2 --> OR
        OP2 --> CFP
        OP2 --> MIST
        OP2 --> LDL
        MLR --> GPT120[gpt-oss-120b]
        MLR --> NOMIC[nomic-embed]
    end
    
    subgraph "Dead / Not Wired"
        FALL[Fallback Proxy :20130] -.->|no caller| OP1
        FALL -.->|tunnel disabled| TUN[Omni-tunnel :20129]
        FALL -.-> MLR
        LLAMA[Local Llama :8081] -.->|not registered| OP1
        MAC[Mac Lane] -.->|separate stack| FP
        CODEX[Codex CLI] -.->|not installed| OC
        GEMINI[Gemini CLI] -.->|not installed| OC
        CURSOR[Cursor CLI] -.->|not installed| OC
    end
    
    subgraph "OpenCode Built-ins (Remote)"
        OB[opencode.ai API] --> B1[beam-free]
        OB --> B2[deepseek-v4.1-flash-free]
        OB --> B3[hy4-flash-free HANG]
        OB --> B4[+43 more free]
    end
    
    style OP1 fill:#ffcccc
    style OP2 fill:#ffcccc
    style MLR fill:#ccffcc
    style LLAMA fill:#ccffcc
    style FALL fill:#ffcccc
    style MAC fill:#ffffcc
    style CODEX fill:#ffcccc
    style GEMINI fill:#ffcccc
    style CURSOR fill:#ffcccc
```

## Port/Protocol/Auth Matrix

| Component | Port | Binds | Auth | Status |
|-----------|------|-------|------|--------|
| opencode-web | 4096 | 127.0.0.1 | None | ALIVE |
| Front Proxy | 20140 | 0.0.0.0 | Estate OMNIROUTE_API_KEY (injected) | ALIVE |
| OmniRoute Primary | 20128 | 127.0.0.1 | API Key required | ALIVE (401 without key) |
| OmniRoute-B | 20131 | 127.0.0.1 | API Key required | ALIVE (401 without key) |
| Mac LMStudio Relay | 11234 | 172.17.0.1 / 127.0.0.1 | None | ALIVE |
| Fallback Proxy | 20130 | 127.0.0.1 | Unknown | DEAD (no caller) |
| Local Llama | 8081 | 127.0.0.1 | None | ALIVE (not wired) |
| caddy-local | 20180/20182 | 127.0.0.1 | None | ALIVE |
| Omni-tunnel | 20129 | - | - | DISABLED |

## Model Registry Summary

| Model | Source | Max Concurrency | Health (last 24h) | Notes |
|-------|--------|-----------------|-------------------|-------|
| estate-coding | OmniRoute | 32 | Often healthy, rerouted on 429 storms | Primary workhorse |
| free-only | OmniRoute | 16 | Frequently unhealthy (probed) | Fallback |
| groq/openai/gpt-oss-120b | OmniRoute | 8 | Occasionally healthy | |
| openrouter/openai/gpt-oss-120b | OmniRoute | 8 | CREDITS EXHAUSTED | Dead route |
| cfp/openai/gpt-oss-120b | OmniRoute | 8 | Frequently unhealthy | |
| mistral/codestral-latest | OmniRoute | 8 | Sometimes healthy | |
| local-dell-llama | OmniRoute | 8 | NOT REGISTERED | Qwen on :8081 |
| mac-lmstudio-relay | Mac Relay | 8 | Healthy | gpt-oss-120b + nomic-embed |
| opencode/beam-free | OpenCode Remote | N/A | Unknown | Remote, 3rd party |
| opencode/deepseek-v4.1-flash-free | OpenCode Remote | N/A | Excluded from merge-gate | Remote |
| opencode/hy4-flash-free | OpenCode Remote | N/A | HUNG 54/54 | Off rotation |