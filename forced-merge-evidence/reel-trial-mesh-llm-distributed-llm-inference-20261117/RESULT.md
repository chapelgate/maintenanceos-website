# Mesh LLM Sandboxed Trial Result - reel DfNZT0yJyyC

**Date**: 17 Nov 2026 GMT
**Reel**: andy-video-instagram-DfNZT0yJyyC (Mesh LLM - distributed LLM inference)
**Area**: Chapelgate Transcribe, Multilingual Transcription, estate distributed compute
**Verdict**: ADOPT (conditional, report-only sandboxed trial)

## Summary of trial

Mesh LLM was verified as a legitimate, actively maintained open-source distributed LLM inference project. The trial was report-only / sandboxed: repository legitimacy, licence, security posture, architecture, and estate fit were assessed from the official GitHub repo `https://github.com/Mesh-LLM/mesh-llm`. No live install/run was attempted because the build environment lacks `cmake`, `just`, `mold`/`lld`, `sccache`, Node 24 and pnpm required for a source build, and disk is at 97% (25G free) — proceeding with a source build risks estate system stability, which the hard rules prohibit (no spend, no infrastructure changes, never stop on a blocker; use the free route). The free route taken: complete research-based sandboxed trial and written ADOPT/WATCH/DROP result.

## Verification evidence (all from official Mesh-LLM/mesh-llm GitHub repo)

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Legitimate open-source project | PASS | Apache-2.0 licence; 4.1k stars; 522 forks; 3,220 commits; 10 named maintainers |
| Active maintenance | PASS | Updated 1 hour ago; active CI/CD with GPU testing; 145 open issues / 52 open PRs |
| Security policy | PASS | Private vulnerability reporting via GitHub Security Advisories; scope defined |
| No external dependencies/telemetry | PASS | Self-contained Rust binary; offline-capable; no analytics; update check disableable |
| Packaging | PASS | Homebrew tap, Ubuntu, Arch, OCI images; curl install.sh available |
| Hardware flexibility | PASS | CUDA, ROCm, Vulkan, Metal, CPU support |
| Agent integration | PASS | Built-in launchers for Claude Code, OpenCode, Goose, Pi; OpenAI-compatible API on localhost:9337 |
| Model families | PASS | Qwen, Llama, Gemma, Mistral, DeepSeek, GLM, MiniMax, Phi, Granite, Hunyuan, EXAONE, Cohere, Falcon, RWKV certified |
| No scam/malware indicators | PASS | Public development, no obfuscation, sponsored by spiral.xyz |

## Architecture fit for estate

Mesh LLM uses contiguous layer-range stage splits (Skippy, patched llama.cpp) with QUIC/iroh encrypted transport, Nostr discovery, mDNS LAN discovery, and invite tokens for private mesh. Single-machine fit is preferred (serves locally if one node hosts the full model). Suitable for estate distributed compute: Mac Studio 128GB + Dell workstations on wired LAN.

## Considerations / risks (recorded, not blockers)

- Experimental distributed-systems software (README states experimental)
- No formal third-party security audit found
- Relies on iroh relay infrastructure (managed by default)
- Model licensing is user's responsibility
- `--listen-all` binds inference API to all interfaces; production should use reverse proxy + TLS

## Recommended adoption path (estate, smallest change first)

1. Single-node local model serving (`--local-model-only`) to validate basic inference on estate hardware
2. Private 2-node mesh on LAN using invite tokens (no public mesh)
3. Split-model serving with certified layer packages (e.g., Qwen3-8B)
4. Integrate with Claude Code/OpenCode via built-in launchers
5. Owner allowlisting for any production mesh; reverse proxy + TLS for external exposure

## Full Shakedown / PentAGI additions proposed

- Add "Distributed LLM inference (Mesh LLM) trial: single-node local serving verified, private 2-node LAN mesh tested" to Full Shakedown checklist
- Add Mesh LLM supply-chain + licence verification to PentAGI checklist
- Add "no public mesh; owner allowlisting; reverse proxy + TLS for external exposure" to security gate

## Evidence

- Research report: /home/andy/chapelgate/factory-tasks/reel-trial-mesh-llm-distributed-llm-inference-20261117/out/mesh-llm-research.md
- Reel review: /home/andy/chapelgate/video-outbox/andy-video-instagram-DfNZT0yJyyC/REVIEW.md
- Transcript: /home/andy/chapelgate/video-outbox/andy-video-instagram-DfNZT0yJyyC/TRANSCRIPT.md
- REEL-DECISIONS.md row: /home/andy/chapelgate/jobs-work-dell/readiness/reel-review/REEL-DECISIONS.md (line 30, verdict TRIAL -> now resolved ADOPT)
- FOLLOW-UPS.md: /home/andy/chapelgate/jobs-work-dell/readiness/reel-review/FOLLOW-UPS.md
