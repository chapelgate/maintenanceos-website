# Hyperframes Trial Result - Df1DI7gjTYZ

## Verdict: ADOPT

### Summary
Successfully generated an 8-second MP4 video from Hyperframes code-to-video via Claude Code. The trial produced a complete video composition with animated title, subtitle, tagline, and footer from a single HTML file.

### What Was Done
1. **Sandboxed trial**: Created isolated workspace at `hf-trial/hf-demo`
2. **Composition**: Wrote HTML with GSAP-animated clips (logo, title "HyperFrames", subtitle "Code to Video", tagline, footer)
3. **Render**: Executed `npx hyperframes render -o output.mp4`
4. **Network monitoring**: Tracked egress during npx install/render; only npm registry and Google Fonts (Roboto, cached)

### Output
- **Video**: `/tmp/hf-trial/output.mp4` → `/home/andy/chapelgate/factory-tasks/reel-trial-hyperframes-code-to-video-via-claude-code-20261117/out/hyperframes-demo.mp4`
- **Duration**: 8.0 seconds @ 30fps
- **Size**: 78.5 KB
- **Format**: ISO Media, MP4 Base Media v1 [ISO 14496-12:2003]

### Evidence
- `/home/andy/chapelgate/factory-tasks/reel-trial-hyperframes-code-to-video-via-claude-code-20261117/out/hyperframes-demo.mp4`
- IMPLEMENTATION-STATUS.md entry: `2026-11-17 22:15 GMT | trial | reel Df1DI7gjTYZ | ADOPT | Generated Hyperframes test video for chapelgate-transcribe docs; 8s MP4 from HTML composition; evidence: out/hyperframes-demo.mp4`
- Lint: 0 errors, 6 warnings
- Render pipeline metrics: compile 0.1s · extract 0.0s · audio 0.0s · probe 0.0s · setup 2.0s · capture 6.9s · encode 6.8s · assemble 0.0s

### Chapelgate-transcribe Docs Integration
The generated test video can be used for chapelgate-transcribe docs as a demo video showing code-to-video capability.

### ADOPT Verdict Rationale
- Video generation works end-to-end from HTML composition
- No network egress concerns (only npm registry and cached Google Fonts)
- MP4 output is valid and playable
- Composition is fully local and reproducible
- Trial completed successfully with deterministic output