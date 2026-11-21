2026-11-11 08:54 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 33m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 09:00 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 38m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 09:15 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 53m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 09:30 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 68m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 09:45 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 83m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 13:00 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 32m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 13:15 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 47m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 13:30 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 62m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 14:00 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 24m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 14:15 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 39m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 14:45 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 24m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 15:00 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 39m running; files15m=0 out15m=0 progress_age=-1m
2026-11-11 15:00 STALLED foreman-gaps-cr001-004: no repo or out/ changes in 15m after 38m running; files15m=0 out15m=0 progress_age=58m
2026-11-11 15:15 STALLED dell-fix-housing-compliance-vault: no repo or out/ changes in 15m after 54m running; files15m=0 out15m=0 progress_age=-1m
2026-11-15 21:08 GMT STALLED stt-improve-loop: runner exited unexpectedly and systemd restarted it (systemd restart count now 1); see logs/runner.log
2026-11-15 21:10 GMT STALLED stt-improve-loop: no new scored result for 1 min (limit 10); restarted the runner
2026-11-16 10:38 GMT STALLED stt-improve-loop: runner exited unexpectedly and systemd restarted it (systemd restart count now 1); see logs/runner.log
2026-11-16 11:46 GMT STALLED stt-improve-loop: no new scored result for 2 min (limit 1); restarted the runner
- 2026-11-16 20:52 GMT STALE-CHECK: FAILING-FAST: council-router-redundancy-20261116 (unit council-router-redundancy-r1)
2026-11-17 02:42 GMT STALLED stt-improve-loop: no new scored result for 11 min (limit 10); restarted the runner
- 2026-11-17 06:22 GMT STALE-CHECK: IDLE no unit, not finished: droplet-carry-legal-case-management-build (6h)
- 2026-11-17 10:52 GMT STALE-CHECK: IDLE no unit, not finished: droplet-carry-council-cycle (9h)
- 2026-11-17 14:39 GMT STALE-CHECK: Watchdog stale (>10m)

### MODEL PREFLIGHT 2026-11-17T15:40:58Z
- model 'bogus/x' is NOT in opencode's model list (/home/andy/.config/opencode/opencode.json) - cycle for testjob falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-17T15:40:59Z
- sweep: model 'model(-' (from rate-reroute/route.model/jobs.tsv) is NOT in opencode's model list - cycles naming it fall back to estate-coding

### MODEL PREFLIGHT 2026-11-17T15:40:59Z
- sweep: model '=' (from rate-reroute/route.model/jobs.tsv) is NOT in opencode's model list - cycles naming it fall back to estate-coding

### MODEL PREFLIGHT 2026-11-17T15:40:59Z
- sweep: model 'default)' (from rate-reroute/route.model/jobs.tsv) is NOT in opencode's model list - cycles naming it fall back to estate-coding

### MODEL PREFLIGHT 2026-11-17T15:41:15Z
- correction: the 15:40-15:41 preflight alerts above (bogus/x, model(-, =, default)) were a self-test and a header-parsing bug in the new check, not real misses. sweep is now clean.

- 2026-11-17 16:06 GMT eggbot: root / at 96% (32G free) tripped the bulk reel scrape root guard. bulk.sh root stop raised to 98% (bulk writes only to /mnt/d; backup bulk.sh.bak-eggbot-20261117-1610). run-ids.sh guard now ROOTMAX env, default 96 unchanged. root growth is long-standing, not a runaway (syslog 584M largest recent file).

- 2026-11-17 16:31 GMT eggbot: main drive / losing ~6-11 MB/min (32250M->32216M free 16:25-16:30); 98% bulk guard trips at ~13G free, so ~19G headroom = ~1-2 days. Not the bulk scrape (writes /mnt/d) and not syslog (~20k lines/hr). Source not yet found; investigating. syslog 585M needs sudo rotate (parked route).
- 2026-11-17 16:40 GMT eggbot: main-drive growth is diffuse build writes (~15MB/min: /tmp, ai-stage4, opencode db, journal), no single runaway. Moving held/done taskdirs omniroute-lane-widen-20261112 (14G) + mac-provider-add-20261113 (4G) to /mnt/d/factory-tasks-archive with symlinks back (unit eggbot-taskdir-move, log moves.log).
- 2026-11-17 16:53 GMT reel adoption: ADOPT Dfwd0vkDLUq (7 fastest-growing Claude skills) shipped, check passed.
- 2026-11-17 16:53 GMT reel adoption: TRIAL DfevuYyvCTB (TwIL-8B open-weights reasoning model) shipped, check passed.
- 2026-11-17 16:53 GMT reel adoption: ADOPT DfiLiSKDKh9 (AI sandbox sealing (network off, non-root, short-lived keys)) shipped, check passed.
- 2026-11-17 16:53 GMT reel adoption: ADOPT DfnVLueCk7K (AI agent kill switch (revoke keys, spend caps, drill)) shipped, check passed.
- 2026-11-17 16:53 GMT reel adoption: ADOPT DfQKAoLgqq4 (SaaS productization: data separation, runbooks, audit) shipped, check passed.
- 2026-11-17 16:53 GMT reel adoption: ADOPT DfAmYQQDsNW (Fine-tuning misunderstanding: knowledge in folder, behaviour in model) shipped, check passed.
- 2026-11-17 16:53 GMT reel adoption: ADOPT DfIUvtMm_IS (Logging AI agent failures (FAILURE-LOG.md compliance)) shipped, check passed.
- 2026-11-17 17:17 GMT reel adoption: TRIAL DfkRRSjTI9v (Voice agent approval workflow (ClaudeCode + Fish Audio Drama 3)) shipped, check passed.
- 2026-11-17 17:17 GMT reel adoption: ADOPT DfmvaNNtor_ (Anthropic playbook pattern (one agent + playbook per job)) shipped, check passed.
- 2026-11-17 17:22 GMT STALE-CHECK: FAILING-FAST: layer7-ai-observability-20261117 (unit layer7-ai-observability)
- 2026-11-17 17:32 GMT reel adoption: ADOPT Df0iNHRoAkP (Mass assignment vulnerability (is_admin field injection)) shipped, check passed.
- 2026-11-17 18:27 GMT reel adoption: ADOPT Df0iNHRoAkP (Mass assignment vulnerability (is_admin field injection)) shipped, check passed.
- 2026-11-17 18:27 GMT reel adoption: TRIAL DfNZT0yJyyC (Mesh LLM - distributed LLM inference) shipped, check passed.
- 2026-11-17 18:52 GMT STALE-CHECK: Watchdog stale (>10m)
- 2026-11-17 19:07 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-17 19:15 eggbot: root fell 50G->21G free 16:40-19:10 (burst; now ~10MB/min). moved idle /tmp/opencode/dl_test (fleurs parquet, ~9G) to /mnt/d/factory-tasks-archive with symlink back.
- 2026-11-17 19:28 GMT reel adoption: ADOPT Df0iNHRoAkP (Mass assignment vulnerability (is_admin field injection)) shipped, check passed.
- 2026-11-17 19:28 GMT reel adoption: TRIAL DfNZT0yJyyC (Mesh LLM - distributed LLM inference) shipped, check passed.
- 2026-11-17 20:26 GMT reel adoption: ADOPT Df0iNHRoAkP (Mass assignment vulnerability (is_admin field injection)) shipped, check passed.
- 2026-11-17 20:26 GMT reel adoption: TRIAL DfNZT0yJyyC (Mesh LLM - distributed LLM inference) shipped, check passed.
2026-11-17 20:40 GMT STALLED stt-improve-loop: no new scored result for 10 min (limit 10); restarted the runner
- 2026-11-17 20:42 GMT reel adoption: ADOPT Df0iNHRoAkP (Mass assignment vulnerability (is_admin field injection)) shipped, check passed.
- 2026-11-17 20:42 GMT reel adoption: TRIAL DfNZT0yJyyC (Mesh LLM - distributed LLM inference) shipped, check passed.
- 2026-11-17 20:42 GMT reel adoption: TRIAL DfuiklzvJf5 (Meta Asterix design system (150+ components, MCP server)) shipped, check passed.
- 2026-11-17 20:42 GMT reel adoption: ADOPT De5cnFuok6H (OAuth redirect URI validation (Google OAuth)) shipped, check passed.
- 2026-11-17 20:42 GMT reel adoption: TRIAL DfSSgfbDSBh (Context Mode plugin for Claude Code) shipped, check passed.
- 2026-11-17 20:42 GMT reel adoption: TRIAL Dfthjnxhi1j (Hallmark design skill (Together AI, 50 themes, 755 photos, browser review)) shipped, check passed.
- 2026-11-17 20:42 GMT reel adoption: TRIAL Dft_wgjyIKU (CodeJury two-model jury AI code review) shipped, check passed.
- 2026-11-17 20:44 GMT AUTO-HEAL NEEDS ANDY: Re-score of the 12 products is blocked only on Andy-only last gates: **NO-GO for all 12 products** — No product commercially releasable. All require Andy-only LAST GATES (host, legal, certs, price, support, live acceptance). ISO 9001 QMS Evidence BLOCKED. PR #140 audit HOLD. Engineering. Tried: nothing more can be done by councils. Needed: Andy's decisions on hosting, legal, certificates, prices, support and live acceptance (list in readiness/LAST_GATES.md)
- 2026-11-17 21:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-review-council-20261117-1452 (6h)
- 2026-11-17 21:07 GMT STALE-CHECK: IDLE no unit, not finished: sandbox-trial-unit-20261117 (6h)
- 2026-11-17 21:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-review-council-20261117-1507 (6h)
- 2026-11-17 21:32 GMT reel adoption: TRIAL DfuUTo7xJmd (Top 10 MCP servers ranking) shipped, check passed.
- 2026-11-17 21:32 GMT reel adoption: TRIAL Df1UMEYALIu (Open-source voice cloning (local, CPU, 7-sec clone)) shipped, check passed.
- 2026-11-17 21:37 GMT STALE-CHECK: FAILING-FAST: council-iso9001-qms-evidence-20261116 (unit council-iso9001-qms-evidence-r2)
- 2026-11-17 21:37 GMT STALE-CHECK: IDLE no unit, not finished: reel-review-council-20261117-1522 (6h)
- 2026-11-17 21:47 GMT reel adoption: ADOPT DfkyVD2MWT4 (Fable 5.2 progressive disclosure, skills, Insights) shipped, check passed.
- 2026-11-17 21:47 GMT reel adoption: TRIAL Df1uC6sSXO2 (OCR It - local PDF OCR browser extension) shipped, check passed.
- 2026-11-17 22:05 uploader-check: NEW account modawallabs_ (reel De4jJeINfWc) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-17 22:05 uploader-check: NEW account professorglitch.automation (reel DfkLZRZM2uw) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-17 22:10 uploader-check: NEW account agentic.james (reel Df1GRlrADS6) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-17 22:10 uploader-check: NEW account kirkstencell (reel DftKtNYn5EA) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-17 22:17 GMT reel adoption: ADOPT DcwkX6OyduT (Six UI/UX principles for product design) shipped, check passed.
- 2026-11-17 22:17 GMT reel adoption: ADOPT DfzvuBcORuK (Outcome first prompting) shipped, check passed.
- 2026-11-17 22:32 GMT reel adoption: TRIAL DfYqlcJxLe1 (Five MCP connectors for Claude) shipped, check passed.
- 2026-11-17 22:32 GMT reel adoption: ADOPT DfzvCAdg89R (Git/GitHub version control for AI coding) shipped, check passed.
- 2026-11-17 22:37 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-17 22:47 GMT reel adoption: ADOPT DfzuDzFIl67 (AI receptionist demo (Claude Code + Retell)) shipped, check passed.
- 2026-11-17 22:47 GMT reel adoption: ADOPT DfzZgEfsr7M (Musk 5-step building algorithm) shipped, check passed.
- 2026-11-17 23:02 GMT reel adoption: ADOPT DfuiBUgxlI3 (48 laws of powerful agents) shipped, check passed.
- 2026-11-17 23:17 GMT reel adoption: ADOPT DfutchuKzhY (Voice cloning tool (3-sec audio, no login)) shipped, check passed.
- 2026-11-17 23:17 GMT reel adoption: ADOPT Dfx4F5CtsPD (Anti-sycophancy prompt for AI settings) shipped, check passed.
- 2026-11-17 23:32 GMT reel adoption: ADOPT Dew7qsIMY7g (Six essential documents before vibe coding) shipped, check passed.
- 2026-11-17 23:32 GMT reel adoption: ADOPT Df0HSA8huc7 (Mythos 5.2 AI security testing finds 12 vuln classes) shipped, check passed.
- 2026-11-17 23:47 GMT reel adoption: ADOPT DfkTLJ-E7_q (Cloudflare AI Security Audit skill (open source, 20k stars, 7000+ vulns)) shipped, check passed.
- 2026-11-18 00:17 GMT reel adoption: ADOPT Dfx1y9mMzuV (Local vs global problems methodology) shipped, check passed.
- 2026-11-18 00:47 GMT reel adoption: TRIAL Df1DI7gjTYZ (Hyperframes - code-to-video via Claude Code) shipped, check passed.
- 2026-11-18 00:47 GMT reel adoption: TRIAL Dfra7fQSJMo (Kern rootless sandbox (3ms)) shipped, check passed.
- 2026-11-18 01:27 GMT disk-mover D ceiling 2026-11-18: D has 45G free (floor 75G), root has 19G free; mover paused, disk council must free D
- 2026-11-18 02:02 GMT reel adoption: ADOPT Dfyxgg2Dthm (Cloudflare AI Security Audit skill) shipped, check passed.
- 2026-11-18 02:32 GMT reel adoption: ADOPT Dfoe_jjAk6B (vLLM (UC Berkeley open-source inference server, PagedAttention)) shipped, check passed.
- 2026-11-18 02:47 GMT reel adoption: ADOPT DfxqLyUxckg (Bottleneck theory for over-engineering) shipped, check passed.
- 2026-11-18 05:02 GMT reel adoption: ADOPT DfySaufyCxU (Cybermes autonomous verified security agent) shipped, check passed.
- 2026-11-18 05:02 GMT reel adoption: TRIAL DfmhlEktysK (Terminal Phone (iPhone in terminal, AI agent control)) shipped, check passed.
- 2026-11-18 05:17 GMT reel adoption: ADOPT DejyVmbA9ef (AI coding agent dependency supply chain risk) shipped, check passed.
- 2026-11-18 05:32 GMT reel adoption: ADOPT Dfr7HAkHxPK (Shadow AI usage (64% on personal accounts)) shipped, check passed.
- 2026-11-18 05:32 GMT reel adoption: TRIAL Dfk-6CmyA1V (Claude Code Front-end Design Toolkit (70+ tools, theming, animations)) shipped, check passed.
- 2026-11-18 05:32 GMT reel adoption: TRIAL DfkvAQFMGI4 (Numbat model malware warning (Oathbreaker advocacy)) shipped, check passed.
- 2026-11-18 06:47 GMT reel adoption: TRIAL DfhjuprtqJo (Claude Skills: short files standardizing agent behavior) shipped, check passed.
- 2026-11-18 07:32 GMT reel adoption: ADOPT DfoaoLKy99b (Tech-Debt-Skill (AI code audit, GitHub ksimback/tech-debt-skill)) shipped, check passed.
- 2026-11-18 07:47 GMT reel adoption: ADOPT DfqlTElB6Ko (AI usage cost tracking per user/agent) shipped, check passed.
- 2026-11-18 07:47 GMT reel adoption: TRIAL Dfi1moWS6Dh (Ambient Context local work diary for AI) shipped, check passed.
- 2026-11-18 07:47 GMT reel adoption: TRIAL DfpRpfsCexS (Hermes Agent 6 levels + Hearth release (1650 changes, skills, team, scheduled, agent OS)) shipped, check passed.
- 2026-11-18 08:02 GMT reel adoption: TRIAL Dfot6IfiQM2 (Gemini Decision 1: fast decision model (yes/no, multiple choice, scoring)) shipped, check passed.
- 2026-11-18 08:47 GMT reel adoption: TRIAL Dfqt5mLgg20 (Vercel Agent Browser (AI agent testing)) shipped, check passed.
- 2026-11-18 09:02 GMT reel adoption: TRIAL DfzCih1iCZ2 (Google Antigravity 2.32.0 Swarm + Dynamic Workflows (multi-agent, browser agent)) shipped, check passed.
- 2026-11-18 09:17 GMT reel adoption: ADOPT DfqnwuCBFGl (Microsoft outage (health-check cascade)) shipped, check passed.
- 2026-11-18 09:17 GMT reel adoption: ADOPT DZAw8CcRXM6 (13 layers of production stack) shipped, check passed.
- 2026-11-18 09:17 GMT reel adoption: TRIAL Df2nfTWPEk8 (Mailflare: self-hosted Google Workspace alt with AI agents + MCP) shipped, check passed.
- 2026-11-18 09:32 GMT reel adoption: TRIAL DfkE66PjPbH (Calibri (744B model on CPU, disk streaming, OpenAI API, 45k stars)) shipped, check passed.
- 2026-11-18 09:32 GMT reel adoption: TRIAL DfgdW1kvs_I (Claude Red: free open-source security playbooks for Claude Code) shipped, check passed.
- 2026-11-18 09:47 GMT reel adoption: TRIAL DfjEhL3hltm (TradingAgents multi-agent adversarial pattern) shipped, check passed.
- 2026-11-18 10:02 GMT reel adoption: TRIAL DfphR2sCjVT (OpenAI Businesses in ChatGPT (Business Hub, Business Agents, Business Insights)) shipped, check passed.
- 2026-11-18 10:17 GMT reel adoption: TRIAL DfkH92WyX-s (LatticeDB (local graph+semantic+text DB, ZIG, single file)) shipped, check passed.
- 2026-11-18 10:17 GMT reel adoption: TRIAL DfgbIrJSkEY (RedCell: AI pentesting agent (recon, CVE, prompt injection)) shipped, check passed.
- 2026-11-18 10:17 GMT reel adoption: TRIAL DfpV4ASkeDW (Claude Diagram Design skill (58K stars, flowcharts, org charts, brand matching)) shipped, check passed.
- 2026-11-18 10:22 GMT STALE-CHECK: FAILING-FAST: reel-trial-omega-agent-orchestration-opus-plans-haiku-execu-20261118 (unit reel-trial-omega-agent-orchestration-opus-plans-haiku-execu)
- 2026-11-18 10:22 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-18 10:32 GMT reel adoption: ADOPT Dfp2JeUx6KU (Six pillars for Claude Code business (repo structure, prompts, clients, KB, tools, skills)) shipped, check passed.
- 2026-11-18 10:32 GMT reel adoption: TRIAL Dfjk30VPJZE (Jane Street Socratic Tutor (free Claude skill, adaptive tutoring)) shipped, check passed.
- 2026-11-18 10:32 GMT reel adoption: TRIAL DfjUpD3ivOY (Notion AI second brain template for agents) shipped, check passed.
- 2026-11-18 10:32 GMT reel adoption: TRIAL DfPST3DOhEF (LP Skill design principles (Nielsen, Gestalt, Fitts, Miller)) shipped, check passed.
- 2026-11-18 10:32 GMT reel adoption: TRIAL Df2GPleCP06 (Hermes + Obsidian shared memory for AI agents) shipped, check passed.
- 2026-11-18 10:32 GMT reel adoption: TRIAL DfiGTlghPDH (Claude security anti-patterns (API key front-end, command execution, RLS bypass)) shipped, check passed.
- 2026-11-18 10:32 GMT reel adoption: TRIAL Dfo9hXnitYv (Google Antigravity browser agent (browse, build, test, download approval, login isolation)) shipped, check passed.
- 2026-11-18 10:32 GMT reel adoption: TRIAL DfpXxG0iBT1 (Google Antigravity Voice Mode + Remote Agents + slash swarm) shipped, check passed.
- 2026-11-18 10:32 GMT reel adoption: TRIAL DfpU_1Pi8Fd (AI invoice clerk Copilot Studio (bank-change fraud detection)) shipped, check passed.
- 2026-11-18 10:47 GMT reel adoption: ADOPT DfmxiCrEjqb (Goldman Sachs AI governance + Deloitte accountability (operator framework)) shipped, check passed.
- 2026-11-18 10:47 GMT reel adoption: TRIAL Dflr_oUOwCD (Matt Pocock Skills for Real Engineers (Claude Code plugin, 320k stars)) shipped, check passed.
- 2026-11-18 10:47 GMT reel adoption: TRIAL Dff39V1vpj7 (Omega Agent Orchestration: Opus plans + Haiku executes (1/40th cost)) shipped, check passed.
- 2026-11-18 10:47 GMT reel adoption: TRIAL DfgsRBMyb5a (PiBench: AI coding agent benchmark (real bugs, sandboxed, quantized model comparison)) shipped, check passed.
- 2026-11-18 10:47 GMT reel adoption: TRIAL Dfhm_g_z3cj (47 AI agents running a company (shared brain, model switching, debate)) shipped, check passed.
- 2026-11-18 10:47 GMT reel adoption: TRIAL DfpXC0tBBTa (OpenAI dots: always-on AI agents with own computer, email/calendar/dashboard) shipped, check passed.
- 2026-11-18 11:02 GMT reel adoption: ADOPT Df0NEeSgWYI (Secure AI apps: data→server, server-side auth, secrets→server) shipped, check passed.
- 2026-11-18 11:02 GMT reel adoption: TRIAL DfmRU9bSfJv (Heimdall (local persistent AI agent brain, zero tokens, verified)) shipped, check passed.
- 2026-11-18 11:17 GMT reel adoption: TRIAL DflaX4TyKGC (Bookshelf (self-hosted e-book library, no DB, Cloudflare R2, OPDS)) shipped, check passed.
- 2026-11-18 11:32 GMT reel adoption: TRIAL DfkjcNTy71E (GAL (central AI agent config manager, 17 agents, YAML, dry-run)) shipped, check passed.
- 2026-11-18 11:32 GMT reel adoption: TRIAL DfjCh9Pv91_ (SlashBrag launch video skill for coding agents) shipped, check passed.
- 2026-11-18 11:47 GMT reel adoption: TRIAL DfhiuIRhJY8 (Black Mirror Method: self-cloning with Claude Code (3100 hrs, gray hat)) shipped, check passed.
- 2026-11-18 11:47 GMT reel adoption: TRIAL DfpphplORQW (API key encryption/KMS pattern (plain-text keys in DB is critical vuln)) shipped, check passed.
- 2026-11-18 12:17 GMT reel adoption: TRIAL De9qe5zOr2_ (AI automation, SEO, social media content engine) shipped, check passed.
- 2026-11-18 12:17 GMT reel adoption: TRIAL DfkFpa1BOaA (Claude "paper" skill (local OCR, on-device, free)) shipped, check passed.
2026-11-18 12:43 GMT STALLED stt-improve-loop: runner exited unexpectedly and systemd restarted it (systemd restart count now 1); see logs/runner.log
2026-11-18 12:55 GMT STALLED stt-improve-loop: service was activating; star- 2026-11-18 15:52 GMT STALE-CHECK: Watchdog stale (>10m)
- 2026-11-18 15:52 GMT STALE-CHECK: test suites missing from dashboard
- 2026-11-18 15:52 GMT STALE-CHECK: IDLE no unit, not finished: layer7-ai-observability-20261117 (8h)
- 2026-11-18 17:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-secure-ai-apps-data-server-server-side-auth-secr-20261117 (6h)
- 2026-11-18 17:36 uploader-check: NEW account antoniorevenue (reel De4uosXIUw8) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account hareeshkattagpt (reel Df3tG1JBSkM) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account lifegoalinvestments (reel Df4tmCyx_o6) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account cracked.artificial (reel Df4v9ezg2ZC) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account rahuliyer.ai (reel DfOnojTRLbF) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account bashi_fuirkashi (reel DfU3PNTmR_r) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account dank.ai.papers (reel DfivXS1hpEr) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account aronatlii (reel Dfpjnx4gybG) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account buildwithomar (reel DfqWmHCmU9p) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account j.t.rivard (reel DfvdjKIRHuG) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:36 uploader-check: NEW account danmartell (reel DfxsnFVFjvv) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 17:37 uploader-check: NEW account phanik.ig (reel De4oK2PNPvB) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 18:52 GMT STALE-CHECK: IDLE no unit, not finished: reel-review-council-20261117-1952 (6h)
- 2026-11-18 19:07 GMT STALE-CHECK: FAILING-FAST: reel-scrape-speedup-20261118 (unit reel-scrape-speedup)
- 2026-11-18 19:07 GMT STALE-CHECK: IDLE no unit, not finished: forced-merge-rule-adopt-trial-20261118 (6h)
- 2026-11-18 19:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-full-accounts-overnight-20261117 (6h)
- 2026-11-18 19:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-review-council-20261118-1252 (6h)
- 2026-11-18 19:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-claude-paper-skill-local-ocr-on-device-free-20261117 (6h)
- 2026-11-18 19:07 GMT STALE-CHECK: IDLE no unit, not finished: rt15-fix-hcv-council-minutes-20261118 (6h)
- 2026-11-18 19:07 GMT STALE-CHECK: IDLE no unit, not finished: security-sweep-all-products-20261118 (6h)
- 2026-11-18 19:07 GMT STALE-CHECK: IDLE no unit, not finished: shakedown-failclosed-adoption-diff-20261118 (6h)
- 2026-11-18 19:07 GMT STALE-CHECK: IDLE no unit, not finished: shorts-factory-20261118 (6h)
- 2026-11-18 19:25 uploader-check: NEW account realrobertgutierrez (reel Df5DQZzqVyW) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-18 19:52 GMT STALE-CHECK: IDLE no unit, not finished: ci-selfhosted-runners-lcm-budget-20261118 (6h)
- 2026-11-18 23:45 GMT reel adoption STALLED: Dfz22cAR6tQ (Password reset poisoning vulnerability) past 2026-11-18 20:00, no update since 17 Nov 15:02, unit reel-adopt-password-reset-poisoning-fix.
- 2026-11-18 23:45 GMT reel adoption: ADOPT Dfwd0vkDLUq (7 fastest-growing Claude skills) shipped, check passed.
- 2026-11-18 23:45 GMT reel adoption: TRIAL DfevuYyvCTB (TwIL-8B open-weights reasoning model) shipped, check passed.
- 2026-11-18 23:45 GMT reel adoption: ADOPT DfiLiSKDKh9 (AI sandbox sealing (network off, non-root, short-lived keys)) shipped, check passed.
- 2026-11-18 23:45 GMT reel adoption: ADOPT DfnVLueCk7K (AI agent kill switch (revoke keys, spend caps, drill)) shipped, check passed.
- 2026-11-18 23:45 GMT reel adoption STALLED: DfvDeF1MJYY (Multi-tenant data separation (RLS, IDOR tests)) past 2026-11-18 20:00, no update since 17 Nov 14:55, unit reel-adopt-cross-customer-data-separation.
- 2026-11-18 23:45 GMT reel adoption STALLED: DfxoWqOiQkB (Evidence file for insurers (AI register, 2FA, recovery)) past 2026-11-18 20:00, no update since 17 Nov 14:34, unit reel-adopt-insurer-evidence-file.
- 2026-11-18 23:45 GMT reel adoption STALLED: Dfzpggrp41g (Three invisible AI app problems (data, auth, secrets)) past 2026-11-18 20:00, no update since 17 Nov 14:54, unit reel-adopt-three-question-release-gate.
- 2026-11-18 23:45 GMT reel adoption STALLED: DfdB9ulIJ0H (OAuth grants to Google Workspace / Microsoft 365) past 2026-11-18 20:00, no update since 17 Nov 14:39, unit reel-adopt-oauth-grant-inventory.
- 2026-11-18 23:45 GMT reel adoption: ADOPT DfQKAoLgqq4 (SaaS productization: data separation, runbooks, audit) shipped, check passed.
- 2026-11-18 23:45 GMT reel adoption: TRIAL DfoaoLKy99b (Tech-Debt-Skill - AI code audit) shipped, check passed.
- 2026-11-18 23:45 GMT reel adoption: ADOPT DfutchuKzhY (Voice cloning tool - 3-sec audio) shipped, check passed.
- 2026-11-19 00:02 GMT reel adoption STALLED: Dfz22cAR6tQ (Password reset poisoning vulnerability) past 2026-11-18 20:00, no update since 17 Nov 15:02, unit reel-adopt-password-reset-poisoning-fix.
- 2026-11-19 00:02 GMT reel adoption STALLED: DfvDeF1MJYY (Multi-tenant data separation (RLS, IDOR tests)) past 2026-11-18 20:00, no update since 17 Nov 14:55, unit reel-adopt-cross-customer-data-separation.
- 2026-11-19 00:02 GMT reel adoption STALLED: DfxoWqOiQkB (Evidence file for insurers (AI register, 2FA, recovery)) past 2026-11-18 20:00, no update since 17 Nov 14:34, unit reel-adopt-insurer-evidence-file.
- 2026-11-19 00:02 GMT reel adoption STALLED: Dfzpggrp41g (Three invisible AI app problems (data, auth, secrets)) past 2026-11-18 20:00, no update since 17 Nov 14:54, unit reel-adopt-three-question-release-gate.
- 2026-11-19 00:02 GMT reel adoption STALLED: DfdB9ulIJ0H (OAuth grants to Google Workspace / Microsoft 365) past 2026-11-18 20:00, no update since 17 Nov 14:39, unit reel-adopt-oauth-grant-inventory.
- 2026-11-19 00:02 GMT reel adoption: TRIAL Dfj06Loidyl (Shared AI agent memory (Hermes+Obsidian)) shipped, check passed.
- 2026-11-19 00:02 GMT reel adoption: TRIAL DfjykE7nJDp (Anthropic Fable 5.2 launch) shipped, check passed.
- 2026-11-19 00:17 GMT reel adoption: TRIAL DfkVd-Rkl_2 (BAMA - Mac app rebuild with Claude Code) shipped, check passed.
- 2026-11-19 00:32 GMT reel adoption: ADOPT Df1uC6sSXO2 (OCR It - local PDF OCR browser extension) shipped, check passed.
- 2026-11-19 00:32 GMT reel adoption: TRIAL DfkAKIxCKYw (Fable 5.2 free trial) shipped, check passed.
- 2026-11-19 00:45 uploader-check: NEW account sourcetms (reel Df5iuSZolOn) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df02dHGS3Z1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df03OcFSofO ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df05P8bkvOv ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0ag7wuKnz ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0_aMNGdT_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0ASZDSPp8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0bwhlyc4c ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0cAmHgRRv ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0cfoKjYb7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0cQpnE37u ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0DocOCNSo ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0FzOjCs5y ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0GmBOj8a8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0GvccjWYn ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0JCzfgdAK ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0l9uozf8O ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0LaHiDHj1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0LuJQlIkB ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0PX5hyCOK ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0R4uUktR- ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0RccTmTpW ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0Ro_uioJg ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0SIXmk79i ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0UQHOOhze ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0WQuAAuir ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0YvzmgH5X ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df0ZBfIFQtn ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df12nfwCnuJ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df15FjFhQuS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1bSBtiwtP ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1CggEFHkC ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1DI7gjTYZ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1Dmigk6v- ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1FyWlDi_w ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1lapRCUPp ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1LHXjPv53 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1nTBqiHkQ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1nWEHjWyu ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1oUlbCbEK ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1SlGqSDml ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1uILYK_o0 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1UMEYALIu ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1uOl9Cz8C ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1WJF7CSzW ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df1X895C3DZ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df22k84l2Wg ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df26PMVgGzi ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df26VBVoTQq ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2aRi-AQRf ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2auq3Ecu8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2BqN_NnH4 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2GPleCP06 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2ihe7hTWz ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2IQ79kjuI ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2JgJRvYgQ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2JhApyyLO ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2KC06gdJD ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2l5cUhtUI ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2M9KrzRPx ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2NAS5BFJN ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2NdXdiPtb ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2nfTWPEk8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2oc0XBrpM ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2OrF-FWY6 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2VlKihGQB ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df2wNRYlOo_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df3VKNFgJ53 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df4K1GV2p9o ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df5GwG5KQ6L ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df5xwV7Jk3R ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df6B4eD1wZ8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df6gL3kJ8V2 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df6mN9pQ1r5 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df6vT7cY4u8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df7jH2nK5b1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df7mP4qR8s4 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df7tW6yU1i7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df8kJ3hL6m9 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df8pQ5vX2n3 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df8zC7bM4k6 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df9fD1gH8j2 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df9nV3pL5q7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Df9tR6uY4i1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfe2aGxjgOt ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfe7MJlAgga ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfe-YZZyoIa ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dff39V1vpj7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DffBzPQuvxF ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DffdSK-hxE1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DffJDq9hen- ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DffNbaJqWbS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DffU5-sAbmE ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DffZ2rhSf2u ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DffzFfgM5ja ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfg1intJmCI ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfg5JcTvzKZ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfgbIrJSkEY ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfgdW1kvs_I ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfgqqWmGY2f ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfgQy6ISDlf ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfgsRBMyb5a ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfh1a-BKckZ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfh8oYhR-59 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhA8zMFWce ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhfVhxgVOT ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhHxw-yc4j ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhiuIRhJY8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhjiNBRV0S ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhjOW_SKN8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhjuprtqJo ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhKLKLAdQz ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfhm_g_z3cj ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfhn_K_kZ4z ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfhqk8wS9G6 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhsvPAhjJm ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfhVpXRh65L ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfi1moWS6Dh ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfi4gAkqD50 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfiaIjUyjGg ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfiCWzmET04 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfiePOeic4p ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfiGTlghPDH ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfii4tHNPS9 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfijt47M9Pa ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfiLENUNiN2 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfiUoSZAPxy ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfiwyOGR0Po ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfiXUaBpWO2 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfizIxzRNIX ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfiZJHgj-gb ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfj1XrnxvXw ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfjbXikxB1l ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfjCh9Pv91_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfjEhL3hltm ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfjJaVzswXH ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfjk30VPJZE ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfjl0YxmfzQ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfjRE24SPz5 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfjUpD3ivOY ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfk0ITHSfIj ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfk-6CmyA1V ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkaK4ai9k5 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkaQiXgNLm ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkaUSHjVsP ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkbEuajD00 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkE66PjPbH ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkE8N1vn0g ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkeW7lIRwO ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkfufPDuWg ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkG9Q0B015 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkgnagtIpw ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkgY5dgJHk ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkH92WyX-s ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkhmhfO5_o ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkhpshxkjG ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkKxe6RC-I ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkMuQTGZQl ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkNpjYtCeR ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkpTQpMN7e ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkSVaZgSNW ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkTLJ-E7_q ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkttfFBfq4 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfku3-9g9fR ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfku-myK8V9 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfku-NxKRaG ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkvJvIKyKb ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkYrMvKfxL ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfkZc11CnYh ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfl12ylyhES ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfl5MnhCu4Q ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DflaX4TyKGC ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DflG82asFoB ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DflJpOxM-pg ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DflmiWYBV90 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DflnUyNtrsl ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DflqVZDptqS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dflr_oUOwCD ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfluS4sC8rA ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DflwaZjiMhY ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DflZzItGaW_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfm0CG2iDRn ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfm21xlyBnD ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfm5_O7A-VM ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfm8WwwCfjJ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfm9nYOFKfz ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmaflPNGD6 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmgO2TgMVM ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmhlEktysK ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmHMHiAt4_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmhN2XCeTC ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmhWVfi78A ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmiDfnDFLq ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmisUcOQla ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmoTuaidFC ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmpGzitcOV ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfmpt3wlOJs ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfmrmyvh5ic ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmRU9bSfJv ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmSKheg-73 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfmt2ikhjBT ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmVzJRi8zc (Gemini 4 Carbon on Google Cloud) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmwMTlJ1UF ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfm-WWRKVGj ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmxiCrEjqb ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfmyxZ9BsA0 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfm-zW8mlDP ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfn8JBPlPg7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnAkp_hJZk ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnB-x2svxc ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfncF6diYzb ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfncFKXidhP ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfncHzvix5H ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnEsYxtDGs ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnFOIxFT7B ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnFw5MiSo6 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnGXi6InXL ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnINzSyP4y ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfn_J3Eyfwc ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnjrkQykiI ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnkHePEyP7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfnt_K8BkMG ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfn-V4wBnBR ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfn_ygCFKIS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfnyIQphWAg ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo2GW8SejB ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo39IYihdJ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo3fUliaNS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo3NqXkej7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo3rCqgip- ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo4GeSjGbd ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo4kRojc4J ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo4WZgCEDu ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo6K5GPZys ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo9hXnitYv ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoAQ0slQ0H ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoBtmbCqt4 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoCBobMtba ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoeXROCLDj ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoiUtxChYs ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfo-JQLTPuS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoJxspvtBG ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfopgy7PtJL ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoQcXyjQem ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoQuKAiL33 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfosArKE77_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoSsUCCITz ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfot6IfiQM2 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoU10AiRmC ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoW6XQCVeo ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfowJFQCM-C ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfoyjT9ibUX ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfp1u12BXa1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfp2JeUx6KU ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfp6wEFCezU ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfp6wKwCB4k ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfp6wTsCv1V ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfpa6mxtAe2 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpbLc5EasY ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfpcc9pvFM9 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpCP80tJZI ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpdiOZjR4A ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpdKA7yGl- ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpE1Vtvupu ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpeJRunFfT ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpeuM8mfBl ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfph2IYqGZB ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfphR2sCjVT ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfpk3nZC03t ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpK8ADj_YB ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpLIrGDDf7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfplmuys7VR ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpLV3JjfYV ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfpm8EmTjKx ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpnYUcOy-U ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpO8l8SLTo ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpOjWpDL7d ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpOvcNBMNi ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpphplORQW ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpqD7hiYQs ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpqrwqgYKx ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfprAWFgEFw ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpRktnyOZ- ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfprMLxjZzz ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpRpfsCexS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpSHZ4tcwG ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfptG7_SvWJ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpU_1Pi8Fd ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpV4ASkeDW ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpvbyBjOj_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpwchfBQvp ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpXC0tBBTa ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpXhG-PkNF ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpxJfjEmxw ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfpXxG0iBT1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfq5kqAiIeu ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfq6clmCpvi ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfq9hriCuu9 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfq_c98icG1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqD1wChbah ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfq_dfRSELa ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqdmwMCGGr ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqIguNSlR7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqIijMM461 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfqj-slycDg ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqlTElB6Ko ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqnwuCBFGl ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqO0tkHbv_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfqq6t6x8V7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqRJ4wEzhc ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqRTiflG7v ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfqSzEsw71J ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfqt5mLgg20 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfquw4KBL47 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfquX76jM6S ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfqy8zfAgOp ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfr2ZjoyZCj ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfr4xu5iMrk ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfr5xtEqCPA ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfr6dXevXxu ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfr7Em9iFxv ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfr7HAkHxPK ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfr8ogcS4Lu ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfr9hZngcoe ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfr9q7fOZo1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfra7fQSJMo ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrDBQRlfzo ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrGC9OCfxe ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfrmhe2C7HD ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfroHYEiyym ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfroQBetOJX ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrQxTigOOQ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrRk8VAORS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrsL1QCMpY ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrUP6LG96c ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrvOsSCeiS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfrw1BBi5-C ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrwBY3CnnU ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfryl3licHj ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfryuTZArU2 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrzQlVmSHM ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfrZVpECHa5 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfs-0Egud1m ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfs0Ma4sybQ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfs0Qvhtfw9 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfs3pBlswqe ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfsad7rSCG6 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsBWMDgH72 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsEIwDFKSD ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfseri6v4wh ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsfKYBAWLe ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsGgUHKK5- ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsGpakBKVw ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsH4ZaDPvu ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsHk_WBh3p ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfshOP2hDPE ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsIOKyhvRJ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsLm8UIOlc ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsoJZrtptS ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsOt-KgWWO ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsR3wiyOoP ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsSUKJierh ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsTsxcADlJ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfstUkuk_0t ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfstWWMy7zJ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsVPcthxyY ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfsYSsbRMMv ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfszVHotd6C ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dft452piLaM ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfthjnxhi1j ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DftI0Ntyp2R ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DftI1olv1Aq ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DftkG6HBrx4 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DftkSTES1Ra ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dftn5RICZux ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DftO_v7MZJo ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DftW7j1NBHR ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dft_wgjyIKU ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu03y_A6vn ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu2sO0yPH9 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu30AaCafP ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu32fai-kL ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu35RTi6fO ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu4DzcC1rs ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu4J20ClyC ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu4No2iy9Y ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu6CbJIzAM ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfubN_oybmd ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfuDHVDPlLm ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfue9SrkuTb ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfuekmvu83I ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfuf5YRMxKd ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfugS-dvBXQ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfuiBUgxlI3 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfuK5kmBsFf ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfumNiRPSZV ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfuNc6ENel0 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfuo4CChEq8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfupE-HBIQ6 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfurAKrsaYf ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfu_S0QBQRm ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfusjTsm-xD ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfuutshFxeA ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfuvZVzMuyr ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfuwJZVoBE9 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfuywqUx4-z ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfuZ4mHhJkz ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfv5C7lBXim ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfv8rMdTdxj ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfvcf0LulkM ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfvH5EpGGJf ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfvhtjDDg6f ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfvPQA-j5Ln ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfvSI0OyOtH ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfvtmqiy_E5 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfvW2wsiz5_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfvWEotMPDk ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfvX4UYgxFf ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfw4YVqgl4o ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfw8kI5g1vT ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfwJE9Ry_XV ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfwjiTtAq8p ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfwki8cyyQd ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfwMsXjjhlR ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfwv5ZgAfn8 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfwvMTIIc3f ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfwwK-BABb7 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfx1y9mMzuV ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfx4F5CtsPD ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfxAAj2Sbvx ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfxbeQKS284 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfxcNbsqR1A ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfxDqDQiH11 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfxDYMGBZz5 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfxe2xrhEne ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfxfrrGBvMU ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfxpjMBhj1k ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfxqLyUxckg ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfxRZ8mDkFZ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfyBKxLtq-n ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfycKrfNaGq ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfyrlR9NSNY ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfyT0EsAIj_ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfyt4YQyVIH ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz__0uC43v ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz2bfIssz4 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz2lQ-PKEC ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz2OX-mSWQ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz3h0CKFKH ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz5cHzgyAF ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz9HrKheG1 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz9JBrRyVw ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz_9N0iVFK ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz_-A-CxSa ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzAZmki1ad ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzbuRsuML2 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzCih1iCZ2 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzCzNOFbmK ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzjMF6tuFF ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzJWbySyix ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfzk0Vfyfyl ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzkJeAtjCZ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzLXyNiYBJ ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzoQQIQjY- ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzqfAVB3yc ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfzt5phpiHH ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfztfmRy7kb ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzuDzFIl67 ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzvCAdg89R ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzvuBcORuK ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzwtVaMisW ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzxH4rBdIU ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL Dfz_-xoi_Ao ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzyKKrMf_i ((from bulk)) shipped, check passed.
- 2026-11-19 00:47 GMT reel adoption: TRIAL DfzZgEfsr7M ((from bulk)) shipped, check passed.
- 2026-11-19 00:50 uploader-check: NEW account mrfaisalamin.ai (reel De46to-ODQ-) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 01:02 GMT reel adoption: TRIAL DfkAi9wFb3p (Physical AI with Raspberry Pi) shipped, check passed.
- 2026-11-19 01:02 GMT reel adoption: TRIAL DfkVKh8ARFd (Fable Reset) shipped, check passed.
- 2026-11-19 01:02 GMT reel adoption: TRIAL DfljQG0kweK (CRM for contractor) shipped, check passed.
- 2026-11-19 01:02 GMT reel adoption: TRIAL DfnbhXaCtVd (AI profit boardroom: Claude + Obsidian SEO) shipped, check passed.
- 2026-11-19 01:17 GMT reel adoption: TRIAL DfnJpc8D-pd (Claude connectors demo) shipped, check passed.
- 2026-11-19 01:47 GMT reel adoption: TRIAL DfnFHbZjnRF (AI profit boardroom: Claude Whiteboards) shipped, check passed.
- 2026-11-19 02:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-review-council-20261118-1952 (6h)
- 2026-11-19 02:37 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 03:17 GMT reel adoption: ADOPT Df4zHtHRYfB (Harness ownership principle: rules/permissions/checks over models) shipped, check passed.
- 2026-11-19 03:32 GMT reel adoption: TRIAL DfnQ8qkh6Qp (Google Street View blur technique) shipped, check passed.
- 2026-11-19 03:47 GMT reel adoption: TRIAL DfnbigkCapv (AI profit boardroom: ClaudeCodeAgenticOS) shipped, check passed.
- 2026-11-19 04:02 GMT reel adoption: TRIAL DfgusnZipDu (ChatGPT Images 2.6 upgrade - animated GIFs, brand references, faster generation) shipped, check passed.
- 2026-11-19 04:07 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 04:17 GMT reel adoption: TRIAL DfjT6tyig6c (Gemini Notebook flashcard upgrades) shipped, check passed.
- 2026-11-19 04:17 GMT reel adoption: TRIAL DfhkYgGlHpM (SkillTreeOS AI agent map (7 depts, 34 teams, 137 jobs)) shipped, check passed.
- 2026-11-19 04:32 GMT reel adoption: TRIAL Dfiq_nrOzhF (AI landing page generation (PT-BR)) shipped, check passed.
- 2026-11-19 04:32 GMT reel adoption: TRIAL Dff6zcgujnd (Cloudflare AI Security agents creating false positives by modifying code during audit) shipped, check passed.
- 2026-11-19 04:32 GMT reel adoption: TRIAL Dfg9IU8CrYB (Claude Opus 5.5 Agent OS with shared memory across agents) shipped, check passed.
- 2026-11-19 04:32 GMT reel adoption: TRIAL Dfa2lDQpVBF (Nine free GitHub repos as paid tool alternatives) shipped, check passed.
- 2026-11-19 04:32 GMT reel adoption: TRIAL Dfahq3WAaZi (YouTube Agent Skill (free AI content team)) shipped, check passed.
- 2026-11-19 04:47 GMT reel adoption: TRIAL DfiocvWFXd0 (Claude Prompt Master mod) shipped, check passed.
- 2026-11-19 04:47 GMT reel adoption: TRIAL Dfin3zVDzsA (CLI Anything Claude integration) shipped, check passed.
- 2026-11-19 05:02 GMT reel adoption: TRIAL DfkTAvZkw9m (Skillopt sleep cycle for Claude) shipped, check passed.
- 2026-11-19 05:02 GMT reel adoption: TRIAL Dfoe_jjAk6B (vLLM - UC Berkeley inference server) shipped, check passed.
- 2026-11-19 05:02 GMT reel adoption: TRIAL DfiHkIKCIGc (Hermes Agent OS + Step 5 Preview multi-agent AI workflow with Oracle/Astros/Apollo/Obsidian) shipped, check passed.
- 2026-11-19 05:02 GMT reel adoption: TRIAL Dff1Utfy4lv (Sabiql terminal DB client, driverless Postgres/SQLite access) shipped, check passed.
- 2026-11-19 05:02 GMT reel adoption: TRIAL DfgwMghikR8 (Gemini Omni 1.2 Flash AI video generation) shipped, check passed.
- 2026-11-19 05:17 GMT reel adoption: TRIAL DfoP6XYAMD6 (Video-editing skills ranking - security warnings) shipped, check passed.
- 2026-11-19 05:17 GMT reel adoption: TRIAL DfjBHCkjEkM (Five free GitHub AI tool repos) shipped, check passed.
- 2026-11-19 05:32 GMT reel adoption: ADOPT DfalaGDB4UO (Vibe coding Supabase open access rules data exposure) shipped, check passed.
- 2026-11-19 05:47 GMT reel adoption: TRIAL DfhdEUyi7ai (Google AI Studio update: Gemini Omni 1.2 Flash for AI video generation) shipped, check passed.
- 2026-11-19 06:22 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 06:32 GMT reel adoption: TRIAL DfioPDmHCCs (Four Claude SEO tools) shipped, check passed.
- 2026-11-19 06:37 GMT STALE-CHECK: IDLE no unit, not finished: disk-tiering-20261119 (6h)
- 2026-11-19 06:47 GMT reel adoption: TRIAL DfikZ08gofX (Process-before-AI framework stopwatch method) shipped, check passed.
- 2026-11-19 06:47 GMT reel adoption: TRIAL DfajoIxDy6c (Untangle Codebase skill for Claude Code cleanup) shipped, check passed.
- 2026-11-19 07:17 GMT reel adoption: TRIAL DfaXlkzx_Ny (Cloudflare security skill auto-audits systems) shipped, check passed.
- 2026-11-19 07:32 GMT reel adoption: TRIAL DfbCaa6BmWd (Thermonuclear Code Quality Review (Cursor skill)) shipped, check passed.
- 2026-11-19 07:47 GMT reel adoption: ADOPT DfhSL7rtTjO (Five sign-up tests before launch (localhost, Google in-app browser, spam, reset, stranger)) shipped, check passed.
- 2026-11-19 07:47 GMT reel adoption: TRIAL DfaZKDKqjkw (GitHub URL tricks for codebase mapping) shipped, check passed.
- 2026-11-19 07:52 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 08:02 GMT reel adoption STALLED: DfevuYyvCTB (TwIL-8B open-weights reasoning model) past 2026-11-18 20:00, no update since 17 Nov 16:26, unit reel-trial-twil-8b-vs-qwen.
- 2026-11-19 08:02 GMT reel adoption STALLED: DfiLiSKDKh9 (AI sandbox sealing (network off, non-root, short-lived keys)) past 2026-11-18 20:00, no update since 17 Nov 15:06, unit reel-adopt-sandbox-lockdown-dell-agent-units.
- 2026-11-19 08:02 GMT reel adoption STALLED: DfQKAoLgqq4 (SaaS productization: data separation, runbooks, audit) past 2026-11-18 20:00, no update since 17 Nov 15:05, unit reel-adopt-sellable-commercial-readiness.
- 2026-11-19 08:02 GMT reel adoption: TRIAL DfiNZ1piI45 (Hermes multi-agent AI workspace with group chats, slash rewind, browser-based desktop) shipped, check passed.
- 2026-11-19 09:02 GMT reel adoption: TRIAL De06vWKyMTv (Fusion Embedding multimodal model) shipped, check passed.
- 2026-11-19 09:07 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 09:32 GMT reel adoption: TRIAL De193awhNVo (These security issues are gett...) shipped, check passed.
- 2026-11-19 09:47 GMT reel adoption: TRIAL De1nynnzToA ("I sat by the river bank."  "I...) shipped, check passed.
- 2026-11-19 09:52 GMT STALE-CHECK: FAILING-FAST: ai-stage2-holiday-let-operator-20261115 (unit ai-stage2-holiday-let-operator)
- 2026-11-19 09:55 uploader-check: NEW account khanjicyber (reel Df6XO22Mpmi) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 10:02 GMT reel adoption: TRIAL De1ooJqhY3L (Comment “PROJECTS” and I’ll se...) shipped, check passed.
- 2026-11-19 10:02 GMT reel adoption: TRIAL De1qdHkCAyk (AI Found a PHP Hole in 70% of ...) shipped, check passed.
- 2026-11-19 10:02 GMT reel adoption: TRIAL De1sUAtI-7n (Comment NEED if you want the l...) shipped, check passed.
- 2026-11-19 10:02 GMT reel adoption: TRIAL De1uf-_iijl (Build an AI trading team with ...) shipped, check passed.
- 2026-11-19 10:17 GMT reel adoption: TRIAL De1uTH0hCcn (Comment Community to build all...) shipped, check passed.
- 2026-11-19 10:47 GMT reel adoption: TRIAL De1WNahyHQ- (UrbanGround: Testing AI in Rea...) shipped, check passed.
- 2026-11-19 11:02 GMT reel adoption: TRIAL De1uQK2iUOD (You already have an AI that st...) shipped, check passed.
- 2026-11-19 11:02 GMT reel adoption: TRIAL De1y3m9PyCt (Run an open-source AI agent on...) shipped, check passed.
- 2026-11-19 11:02 GMT reel adoption: TRIAL De28Qj2Mlr9 (How to improve a private secur...) shipped, check passed.
- 2026-11-19 11:02 GMT reel adoption: TRIAL De2KDc1MKUS (60 agents on one build, run fr...) shipped, check passed.
- 2026-11-19 11:02 GMT reel adoption: TRIAL De2lalMpIt3 (Black October isn’t over. Part...) shipped, check passed.
- 2026-11-19 11:02 GMT reel adoption: TRIAL De2NGvdgtXQ (General Motors announced some ...) shipped, check passed.
- 2026-11-19 11:15 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 11:32 GMT reel adoption: TRIAL De19Vkblefh (Uh oh, here we go again. Every...) shipped, check passed.
- 2026-11-19 11:32 GMT reel adoption: TRIAL De1ZnyYifu0 (Comment "EDIT" for the free ki...) shipped, check passed.
- 2026-11-19 11:32 GMT reel adoption: TRIAL De2Bb-Suf_k (6 things to be better than 99%...) shipped, check passed.
- 2026-11-19 11:37 GMT STALE-CHECK: GitHub token invalid
- 2026-11-19 12:37 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 14:47 GMT reel adoption: TRIAL De1FMayCK-a (Reverse engineer how any app f...) shipped, check passed.
- 2026-11-19 15:02 GMT reel adoption: TRIAL De2AiukIx6N (This tiny robot duck costs und...) shipped, check passed.
- 2026-11-19 15:02 GMT reel adoption: TRIAL De2J29GFfkH (Forecast price with Kronos, a ...) shipped, check passed.
- 2026-11-19 15:02 GMT reel adoption: TRIAL De2NIrmyNz8 (MiniMax H3 Director Cut Studio...) shipped, check passed.
- 2026-11-19 15:02 GMT reel adoption: TRIAL De2onusyJ5G (Meta N: The AI That Codes Its ...) shipped, check passed.
- 2026-11-19 15:02 GMT reel adoption: TRIAL De2oRu_sLe1 (How long till Claude books me ...) shipped, check passed.
- 2026-11-19 15:02 GMT reel adoption: TRIAL DeMrL7mORBY (LLM Wiki skill organizer) shipped, check passed.
- 2026-11-19 15:07 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 15:17 GMT reel adoption: TRIAL De0Dzg1SVyv (XRepoTest AI code testing) shipped, check passed.
- 2026-11-19 15:17 GMT reel adoption: TRIAL De1xru3StnZ (2D Motion Interface: Captionin...) shipped, check passed.
- 2026-11-19 15:17 GMT reel adoption: TRIAL DeMsUYIT2N4 (AgentCraft AI agents in Minecraft) shipped, check passed.
- 2026-11-19 15:17 GMT reel adoption: TRIAL DeHf-prAh31 (AI native V2 operating system) shipped, check passed.
- 2026-11-19 15:22 GMT STALE-CHECK: FAILING-FAST: ai-stage2-holiday-let-operator-20261115 (unit ai-stage2-holiday-let-operator)
- 2026-11-19 15:37 GMT STALE-CHECK: Watchdog stale (>10m)
- 2026-11-19 15:38 GMT reel adoption: ADOPT Dfz22cAR6tQ (Password reset poisoning vulnerability) shipped, check passed.
- 2026-11-19 15:38 GMT reel adoption: ADOPT DfvDeF1MJYY (Multi-tenant data separation (RLS, IDOR tests)) shipped, check passed.
- 2026-11-19 15:38 GMT reel adoption: ADOPT DfxoWqOiQkB (Evidence file for insurers (AI register, 2FA, recovery)) shipped, check passed.
- 2026-11-19 15:38 GMT reel adoption: ADOPT Dfzpggrp41g (Three invisible AI app problems (data, auth, secrets)) shipped, check passed.
- 2026-11-19 15:38 GMT reel adoption: ADOPT DfdB9ulIJ0H (OAuth grants to Google Workspace / Microsoft 365) shipped, check passed.
- 2026-11-19 15:52 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 15:52 GMT STALE-CHECK: FAILING-FAST: failed-units-triage-20261119 (unit failed-units-triage)
- 2026-11-19 16:02 GMT reel adoption: ADOPT DeNAbHOyJh5 (KRU AI agent key vault) shipped, check passed.
- 2026-11-19 16:52 GMT STALE-CHECK: FAILING-FAST: ai-stage2-holiday-let-operator-20261115 (unit ai-stage2-holiday-let-operator)
- 2026-11-19 17:00 uploader-check: NEW account remy.engineering (reel Df7dEe-oV6_) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 17:02 GMT reel adoption: TRIAL Dffl1Dhi8eX (Hermes AgentOS dashboard demo (Oracle, video agent, SEO pipeline, memory system)) shipped, check passed.
- 2026-11-19 17:02 GMT reel adoption: TRIAL DffdRb2S4U5 (Learn AI automation from scratch in three months with Claude Code) shipped, check passed.
- 2026-11-19 17:05 uploader-check: NEW account ? (reel Df7dEe-oV6) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 17:22 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 17:32 GMT reel adoption: TRIAL Dffl2-6ia4a (Hermes AgentOS complete guide (mixture of agents, Oracle, memory galaxy)) shipped, check passed.
- 2026-11-19 17:47 GMT reel adoption: TRIAL DfdazyGB8fi (Build first AI agent in Claude Code - step-by-step guide) shipped, check passed.
- 2026-11-19 17:47 GMT reel adoption: TRIAL DfdQfxOy5Te (Crawlie - free open-source SEO crawler in Rust) shipped, check passed.
- 2026-11-19 18:07 GMT STALE-CHECK: FAILING-FAST: failed-units-triage-20261119 (unit failed-units-triage)
- 2026-11-19 18:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-scrape-speedup-20261118 (6h)
- 2026-11-19 18:47 GMT reel adoption: ADOPT Dfffqz0nPB6 (UK GDPR data broker opt-out via single BCC email) shipped, check passed.
- 2026-11-19 18:47 GMT reel adoption: ADOPT DfdL5AdAPXf (Microsoft: hackers using AI to scan GitHub for Azure credentials) shipped, check passed.
- 2026-11-19 18:47 GMT reel adoption: TRIAL DfcdAlWhX2_ (AI content system for product visibility) shipped, check passed.
- 2026-11-19 19:08 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 19:17 GMT reel adoption: TRIAL DfcPlJ5iVcZ (Hermes + Obsidian + AgentOS AI assistant with personal notes) shipped, check passed.
- 2026-11-19 19:47 GMT reel adoption: TRIAL DffPzQxClk0 (Jarvis Agent OS running 100% locally on Mac) shipped, check passed.
- 2026-11-19 19:47 GMT reel adoption: TRIAL DfcQvBXIbqW (Three Claude settings for business (Plugins, Connectors, Scheduled Tasks)) shipped, check passed.
- 2026-11-19 19:50 uploader-check: NEW account mattmurphyai (reel DZAw8CcRXM6) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account jackroberts___ (reel DcjDj6fyoZ0) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account adam_ha_yes (reel DcwkX6OyduT) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account kema_the_engineer (reel De5cnFuok6H) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account natemoves (reel De9qe5zOr2_) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account gravitasai.xyz (reel DeR5U-2uj88) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account petersurowski (reel DejyVmbA9ef) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account mikenwo.ai (reel Dew7qsIMY7g) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account youraveragetechbro (reel Df0vdNIgTay) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account aiprofitboardroom_ (reel Df12nfwCnuJ) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account nick_saraev (reel Df1c5H9P5HI) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account comparee.ai (reel Df2-rzpB9Es) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account zachdoesai_ (reel Df2FrnSsuAh) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account ariacodez (reel Df2ZEwhKlNj) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account github_dev (reel Df2k_K1SqQz) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account aarontheinvestigator (reel Df2kzlhq6Yw) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account samro_ai (reel Df2wECqjD_O) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account champmack (reel DfNOYB-hjiH) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account pragmaticcoder.ai (reel DfNZT0yJyyC) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account msbintel (reel DfOnUkLCMZW) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account mathlimasl (reel DfPST3DOhEF) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account liamjohnston.ai (reel DfSSgfbDSBh) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account tessa.fairbrook (reel DfYqlcJxLe1) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account rollins.io (reel DfdtXLfAim5) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account aiadventureryt (reel DfevuYyvCTB) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account nicholas.puru (reel DffKR6cIVQ8) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account michaelpkocher (reel DfkNpjYtCeR) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account alassafi.ai (reel DfkRRSjTI9v) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account bybetterhuman (reel DfkvAQFMGI4) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account sheni_icg (reel DfkyVD2MWT4) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account artofthepossible.ai (reel Dfl5cRYgUOM) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account githubprojects (reel DfliYeNgs6P) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account nateherkai (reel Dfm3zUdHNBs) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account suffcode (reel DfmY8O6BonJ) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account skilltreeos (reel DfmvHjGEYHa) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account murphmaxxing (reel DfsWbkrB6vN) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account codenameposhan (reel DftTkQqnEMw) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account hassandotai (reel DftiFbNxZbp) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account riteshbuilds.ai (reel DfuUTo7xJmd) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account drcintas (reel DfxHGrJyuQc) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account taki.gpt (reel DfxYJcqBhwl) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account nocode.joshua (reel DfzLtQjk4DN) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:50 uploader-check: NEW account aiwithbuntyshah (reel DfzdhMUzXwd) queued for Composio listing (NEW-ACCOUNTS.tsv)
- 2026-11-19 19:52 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-19 20:03 GMT reel adoption: TRIAL DffB3H2ghy7 (Private RAG on Mac with Ollama + AnythingLLM) shipped, check passed.
- 2026-11-19 20:03 GMT reel adoption: TRIAL DfdwC94ufp0 (Cloudflare Security Audit skill for Claude Code/Codex) shipped, check passed.
- 2026-11-19 20:03 GMT reel adoption: TRIAL DfZ76dzsK2_ (RAG PDF question answering) shipped, check passed.
- 2026-11-19 20:22 eggbot: reel Df7PNxkRagB uploader lostandlucky (Jake Van Clief, ig id 6340133328) queued; uploaders.tsv/priority add owed when /mnt/d is remounted.
- 2026-11-19 20:52 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-19 21:07 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-19 21:07 GMT STALE-CHECK: IDLE no unit, not finished: dell-ops-safeguards-20261119 (6h)
- 2026-11-19 21:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-these-security-issues-are-gett-20261119 (6h)
- 2026-11-19 21:22 GMT STALE-CHECK: FAILING-FAST: ln-16-model-preflight-live-20261119 (unit ln-16-model-preflight-live)
- 2026-11-19 21:22 GMT STALE-CHECK: FAILING-FAST: reel-scrape-speedup-20261118 (unit reel-scrape-speedup)
- 2026-11-19 21:22 GMT STALE-CHECK: IDLE no unit, not finished: security-sweep-all-products-20261118 (6h)
- 2026-11-19 21:37 GMT STALE-CHECK: FAILING-FAST: ef-alerts-notify-20261119 (unit ef-alerts-notify)

### MODEL PREFLIGHT 2026-11-19T21:50:00Z
- sweep: model 'cfp/openai/gpt-oss-120b' is listed but DEAD (front proxy not responding)
- 2026-11-19 21:52 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-19 21:52 GMT STALE-CHECK: FAILING-FAST: ln-12-router-failover-20261119 (unit ln-12-router-failover)
- 2026-11-19 21:52 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)

### MODEL PREFLIGHT 2026-11-19T21:53:23Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ln-08-staging-router-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T21:53:24Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ln-14-taskdir-tests-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T21:56:47Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for adoptions-next-steps-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T21:59:50Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for website-reposition-20261117 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:00:00Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for adoption-utilization-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:00:20Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for droplet-carry-legal-case-management-build falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:00:27Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ln-24-private-lane-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:00:34Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ef-model-lane-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:00:42Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ln-15-jobs-tsv-audit-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:00:49Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-five-mcp-connectors-for-claude-20261117 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:00:57Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ai-stage3-holiday-let-operator-20261115 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:02:19Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for business-evidence-wallet-preview-secret-history-exposure-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:02:34Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for failed-units-triage-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:04:34Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for 06-chapelgate-information-rights falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:04:35Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for 03-dashboard-rollback-retention-ports falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:05:01Z
- sweep: model 'mistral/codestral-latest' is listed but DEAD (front proxy not responding)

### MODEL PREFLIGHT 2026-11-19T22:05:01Z
- sweep: model 'groq/openai/gpt-oss-120b' is listed but DEAD (front proxy not responding)

### MODEL PREFLIGHT 2026-11-19T22:05:01Z
- sweep: model 'openrouter/openai/gpt-oss-120b' is listed but DEAD (front proxy not responding)

### DISK GUARD TIMER 2026-11-19T22:05:33Z
- DISK GUARD: root / at 81% (510G used / 127G free), /mnt/d transport endpoint not connected
- DISK GUARD ALERT threshold: 90% on either disk → write to ALERTS.md
- DISK GUARD PAUSE threshold: 95% on either disk → pause new reel/council unit starts
- DISK GUARD BACKUP: sqlite .backup of omniroute storage before root passes 95% (read-only copy, never edit 20128 container)
- DISK GUARD: guard test with fake threshold → run to verify alert/pause/backup behaviour

### MODEL PREFLIGHT 2026-11-19T22:05:48Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for 11-council-minutes falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:05:48Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for 03-maintenanceos falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.
- 2026-11-19 22:07 GMT STALE-CHECK: HUNG: reel-trial-five-mcp-connectors-for-claude-20261117 (unit reel-trial-five-mcp-connectors-for-claude) no cycle output for 134 min
- 2026-11-19 22:07 GMT STALE-CHECK: FAILING-FAST: ln-05-mistral-403-20261119 (unit ln-05-mistral-403)

### MODEL PREFLIGHT 2026-11-19T22:20:00Z
- sweep: model 'free-only' is listed but DEAD (front proxy not responding)

### MODEL PREFLIGHT 2026-11-19T22:20:00Z
- sweep: model 'estate-coding' is listed but DEAD (front proxy not responding)
- 2026-11-19 22:22 GMT STALE-CHECK: HUNG: reel-trial-jarvis-agent-os-running-100-locally-on-mac-20261119 (unit reel-trial-jarvis-agent-os-running-100-locally-on-mac) no cycle output for 129 min
- 2026-11-19 22:22 GMT STALE-CHECK: HUNG: reel-trial-openinbox-free-email-tool-on-cloudflare-20261119 (unit reel-trial-openinbox-free-email-tool-on-cloudflare) no cycle output for 147 min
- 2026-11-19 22:37 GMT STALE-CHECK: HUNG: reel-trial-private-rag-on-mac-with-ollama-anythingllm-20261119 (unit reel-trial-private-rag-on-mac-with-ollama-anythingllm) no cycle output for 161 min

### MODEL PREFLIGHT 2026-11-19T22:45:50Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-openinbox-free-email-tool-on-cloudflare-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:45:50Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-private-rag-on-mac-with-ollama-anythingllm-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:45:50Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-jarvis-agent-os-running-100-locally-on-mac-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:45:52Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-rag-pdf-question-answering-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:45:57Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for 04-maintenanceos-website falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:00Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-review-council-20261119-2207 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:05Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for phone-stage3-maintenanceos-phone-line-20261115 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:36Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for persona-round-public-sector-citizen-agent-20261116 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:48Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ln-03-fallthrough-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:49Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ln-20-first-cycle-size-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:50Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for tutorial-follow-along-holes-20261118 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:50Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ln-09-provider-health-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:50Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for lumi-item4-synthetic-audio-render-20261111 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:50Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for 05-legal-case-management falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:50Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for estate-improvements-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:51Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for persona-round-holiday-let-operator-20261116 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:51Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for persona-round-chapelgate-information-rights-20261116 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:51Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for landlord-os-onboarding-evidence-tenancy-binding-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:51Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for estate-security-programme-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:52Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for business-evidence-wallet-headers-csp-preview-secret-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:52Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for estate-dependency-vulnerability-audit-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:52Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for 05-pins-canary-cost-alerts-orchestrator falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:52Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for 08-holiday-let-operator falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:52Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for pentagi-emergency-stop-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:52Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-adopt-five-sign-up-tests-before-launch-localhost-googl-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:53Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-adopt-mythos-5-2-ai-security-testing-finds-12-vuln-cla-20261117 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:53Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-scrape-speedup-20261118 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:53Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for persona-round-information-rights-complaints-20261116 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:53Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for test-benchmark-skills-coverage-20261117 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:53Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for tutorial-benchmark-rework-20261118 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:53Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for estate-rate-limiting-implementation-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:53Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ef-disk-guard-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:54Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-cloudflare-security-audit-skill-for-claude-code-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:54Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for data-separation-followup-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:54Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for 09-housing-compliance-vault falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:55Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ef-bew-test-fixes-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:55Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for estate-password-reset-poisoning-sweep-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:55Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ef-alerts-notify-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:55Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-ai-video-production-course-7-step-line-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:56Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ln-02-swap-failure-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:56Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for business-evidence-wallet-red-team-ssrf-crypto-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:47:57Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ef-ops-hardening-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:48:57Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for housing-compliance-vault-v1-tables-row-level-security-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:49:58Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for router-outage-fixes-20261115 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T22:50:52Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-redcell-ai-pentesting-agent-recon-cve-prompt-inj-20261118 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.
- 2026-11-19 22:52 GMT STALE-CHECK: HUNG: reel-trial-rag-pdf-question-answering-20261119 (unit reel-trial-rag-pdf-question-answering) no cycle output for 172 min
- 2026-11-19 22:52 GMT STALE-CHECK: HUNG: reel-trial-redcell-ai-pentesting-agent-recon-cve-prompt-inj-20261118 (unit reel-trial-redcell-ai-pentesting-agent-recon-cve-prompt-inj) no cycle output for 175 min

### MODEL PREFLIGHT 2026-11-19T22:53:43Z
- sweep: model 'cfp/openai/gpt-oss-120b' is listed but DEAD (front proxy not responding)

### MODEL PREFLIGHT 2026-11-19T22:54:53Z
- model 'mistral/codestral-latest' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for ln-14-taskdir-tests-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: business-evidence-wallet-red-team-ssrf-crypto-20261119 (unit cso-business-evidence-wallet-red-team-ssrf-crypto-20261119)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: ef-alerts-notify-20261119 (unit ef-alerts-notify)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: estate-security-programme-20261119 (unit cso-estate-security-programme-20261119)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: ln-11-container-reach-20261119 (unit ln-11-container-reach)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: persona-round-holiday-let-operator-20261116 (unit persona-08-holiday-let-operator)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: reel-adopt-five-sign-up-tests-before-launch-localhost-googl-20261119 (unit reel-adopt-five-sign-up-tests-before-launch-localhost-googl)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: reel-adopt-mythos-5-2-ai-security-testing-finds-12-vuln-cla-20261117 (unit reel-adopt-mythos-5-2-ai-security-testing-finds-12-vuln-cla)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: reel-trial-ai-video-production-course-7-step-line-20261119 (unit reel-trial-ai-video-production-course-7-step-line)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: reel-trial-cloudflare-security-audit-skill-for-claude-code-20261119 (unit reel-trial-cloudflare-security-audit-skill-for-claude-code)
- 2026-11-19 23:07 GMT STALE-CHECK: FAILING-FAST: tutorial-follow-along-holes-20261118 (unit tutorial-follow-along-holes)
- 2026-11-19 23:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adoption-titles-20261119 (6h)
- 2026-11-19 23:22 GMT STALE-CHECK: HUNG: reel-trial-top-5-mcps-for-claude-perplexity-playwright-farc-20261119 (unit reel-trial-top-5-mcps-for-claude-perplexity-playwright-farc) no cycle output for 214 min
- 2026-11-19 23:22 GMT STALE-CHECK: HUNG: reel-trial-urbanground-testing-ai-in-rea-20261119 (unit reel-trial-urbanground-testing-ai-in-rea) no cycle output for 204 min
- 2026-11-19 23:22 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-19 23:22 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-19 23:22 GMT STALE-CHECK: FAILING-FAST: pentagi-emergency-stop-20261119 (unit cso-pentagi-emergency-stop-20261119)
2026-11-19 23:26:23 UTC PLUGIN-GUARD: Disabled broken plugin 'heimdall' (moved to /tmp/opencode-smoke-test-config/plugins-disabled/heimdall.js.1795130783) - contained pattern: addOutput
2026-11-19 23:26:23 UTC PLUGIN-GUARD: Pre-cycle smoke test detected and disabled broken plugin(s) in /tmp/opencode-smoke-test-config/plugins

### MODEL PREFLIGHT 2026-11-19T23:31:03Z
- model 'groq/openai/gpt-oss-120b' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-cloudflare-security-audit-skill-for-claude-code-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T23:31:03Z
- model 'groq/openai/gpt-oss-120b' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-three-claude-settings-for-business-plugins-conne-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T23:31:08Z
- model 'groq/openai/gpt-oss-120b' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for adoption-utilization-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T23:31:09Z
- model 'groq/openai/gpt-oss-120b' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-urbanground-testing-ai-in-rea-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T23:31:14Z
- model 'groq/openai/gpt-oss-120b' is NOT live in opencode's omniroute (/home/andy/.config/opencode/opencode.json) - cycle for reel-trial-top-5-mcps-for-claude-perplexity-playwright-farc-20261119 falls back to 'estate-coding'. Fix: add it to the omniroute models in opencode.json or remove it from rate-reroute CANDS / JOB_MODEL.

### MODEL PREFLIGHT 2026-11-19T23:31:26Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for router-outage-fixes-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:31:31Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ai-stage3-holiday-let-operator-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:31:36Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-redcell-ai-pentesting-agent-recon-cve-prompt-inj-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:31:37Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-jarvis-agent-os-running-100-locally-on-mac-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:31:37Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-openinbox-free-email-tool-on-cloudflare-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:31:37Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-private-rag-on-mac-with-ollama-anythingllm-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:31:38Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-rag-pdf-question-answering-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:31:46Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-five-mcp-connectors-for-claude-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:32:24Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 08-holiday-let-operator cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:32:38Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 05-pins-canary-cost-alerts-orchestrator cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:32:46Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-review-council-20261119-2207 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:32:52Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-19-session-retry-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:33:39Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-05-mistral-403-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:33:59Z
- model 'mistral/codestral-latest' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-15-jobs-tsv-audit-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:34:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for test-task-dir cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:34:38Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-release-gate-checklist-and-oauth-dashboard-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:34:44Z
- model 'mistral/codestral-latest' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-02-swap-failure-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:34:45Z
- model 'mistral/codestral-latest' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-08-staging-router-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:00Z
- sweep: model 'estate-coding' is listed but DEAD (front proxy not responding)

### MODEL PREFLIGHT 2026-11-19T23:35:00Z
- sweep: model 'groq/openai/gpt-oss-120b' is listed but DEAD (front proxy not responding)

### MODEL PREFLIGHT 2026-11-19T23:35:00Z
- sweep: model 'openrouter/openai/gpt-oss-120b' is listed but DEAD (front proxy not responding)

### MODEL PREFLIGHT 2026-11-19T23:35:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-11-container-reach-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:39Z
- model 'mistral/codestral-latest' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-09-provider-health-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:39Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-dependency-vulnerability-audit-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:52Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 10-business-evidence-wallet cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:52Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 06-research-ai-test-pipelines cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:52Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ai-stage2-business-os-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:52Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for phone-stage2-maintenanceos-phone-line-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:52Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ai-stage2-holiday-let-operator-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:52Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for fix-safety-screen-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:52Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for fix-backup-failover-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for fix-alerting-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tool-synthetic-data-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tool-agent-orchestration-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tool-cost-tuning-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for scaffold-upgrade-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for sbom-vuln-scan-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tender-dry-run-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for website-council-fit-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for wirral-structural-repairs-local-seo-website-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for wirral-structural-repairs-competitor-research-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for local-dell-qwen-trial-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for website-council-specialist-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-iso27001-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:53Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-owasp-asvs-l2-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-wcag22aa-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-gdpr-accountability-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-soc2-tsc-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-iso9001-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-standards-68-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for phone-stage4-maintenanceos-phone-line-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for phone-stage5-maintenanceos-phone-line-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for wirral-structural-repairs-seo-phase2-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for video-skill-install-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for video-intake-fix-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:54Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for trading-bot-ai-agent-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for rescore-12-products-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for outsider-redteam-review-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for scaffolding-teardown-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for org-adopt-orphan-repos-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for secrets-vault-rotate-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for website-council-deploy-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for narrow-pilot-pack-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for welsh-pilot-pitch-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-review-council-20261117-0916 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-password-reset-poisoning-fix-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cloudflare-security-audit-estate-repos-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-sandbox-lockdown-dell-agent-units-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:55Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-agent-kill-switch-runbook-drill-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:56Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cross-customer-data-separation-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:56Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-insurer-evidence-file-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:56Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-three-question-release-gate-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:56Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-oauth-grant-inventory-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:56Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-sellable-commercial-readiness-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:56Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-lora-behaviour-trial-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:56Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-audio8-speech-model-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:56Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-twil-8b-vs-qwen-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-mesh-llm-distributed-llm-inference-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-voice-agent-approval-workflow-claudecode-fish-au-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adoption-impact-outlook-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-meta-asterix-design-system-150-components-mcp-se-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-anthropic-playbook-pattern-one-agent-playbook-pe-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-oauth-redirect-uri-validation-google-oauth-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-context-mode-plugin-for-claude-code-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hallmark-design-skill-together-ai-50-themes-755-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-codejury-two-model-jury-ai-code-review-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-voice-cloning-tool-3-sec-audio-no-login-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-six-ui-ux-principles-for-product-design-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:57Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-automation-seo-social-media-content-engine-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:58Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-six-essential-documents-before-vibe-coding-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:58Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-fable-5-2-progressive-disclosure-skills-insights-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:58Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-top-10-mcp-servers-ranking-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:58Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for root-cause-safeguards-open-items-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:58Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ocr-it-local-pdf-ocr-browser-extension-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:58Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-open-source-voice-cloning-local-cpu-7-sec-clone-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:58Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hyperframes-code-to-video-via-claude-code-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:58Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-git-github-version-control-for-ai-coding-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:58Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-outcome-first-prompting-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-ai-receptionist-demo-claude-code-retell-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-musk-5-step-building-algorithm-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cloudflare-ai-security-audit-skill-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cybermes-autonomous-verified-security-agent-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-anti-sycophancy-prompt-for-ai-settings-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-local-vs-global-problems-methodology-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-bottleneck-theory-for-over-engineering-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-48-laws-of-powerful-agents-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-shadow-ai-usage-64-on-personal-accounts-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-kern-rootless-sandbox-3ms-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-ai-usage-cost-tracking-per-user-agent-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-microsoft-outage-health-check-cascade-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-six-pillars-for-claude-code-business-repo-struct-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-vllm-uc-berkeley-open-source-inference-server-pa-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-tech-debt-skill-ai-code-audit-github-ksimback-te-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-goldman-sachs-ai-governance-deloitte-accountabil-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:35:59Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-terminal-phone-iphone-in-terminal-ai-agent-contr-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-heimdall-local-persistent-ai-agent-brain-zero-to-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-matt-pocock-skills-for-real-engineers-claude-cod-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-bookshelf-self-hosted-e-book-library-no-db-cloud-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-code-front-end-design-toolkit-70-tools-th-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gal-central-ai-agent-config-manager-17-agents-ya-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cloudflare-ai-security-audit-skill-open-source-2-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-latticedb-local-graph-semantic-text-db-zig-singl-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-paper-skill-local-ocr-on-device-free-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-calibri-744b-model-on-cpu-disk-streaming-openai-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-jane-street-socratic-tutor-free-claude-skill-ada-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-notion-ai-second-brain-template-for-agents-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-tradingagents-multi-agent-adversarial-pattern-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-slashbrag-launch-video-skill-for-coding-agents-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:00Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ambient-context-local-work-diary-for-ai-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-numbat-model-malware-warning-oathbreaker-advocac-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-ai-coding-agent-dependency-supply-chain-risk-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-lp-skill-design-principles-nielsen-gestalt-fitts-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-13-layers-of-production-stack-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-obsidian-shared-memory-for-ai-agents-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-mailflare-self-hosted-google-workspace-alt-with-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-omega-agent-orchestration-opus-plans-haiku-execu-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-red-free-open-source-security-playbooks-f-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-antigravity-2-32-0-swarm-dynamic-workflow-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-pibench-ai-coding-agent-benchmark-real-bugs-sand-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-mods-prompt-rewriting-agent-chat-linking-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-black-mirror-method-self-cloning-with-claude-cod-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-skills-short-files-standardizing-agent-be-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-47-ai-agents-running-a-company-shared-brain-mode-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-security-anti-patterns-api-key-front-end-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gemini-decision-1-fast-decision-model-yes-no-mul-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-antigravity-browser-agent-browse-build-te-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-agent-6-levels-hearth-release-1650-change-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-openai-businesses-in-chatgpt-business-hub-busine-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-antigravity-voice-mode-remote-agents-slas-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-invoice-clerk-copilot-studio-bank-change-frau-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-diagram-design-skill-58k-stars-flowcharts-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-openai-dots-always-on-ai-agents-with-own-compute-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-browser-automation-opencli-turn-website-interact-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-api-key-encryption-kms-pattern-plain-text-keys-i-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-from-bulk-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-shared-ai-agent-memory-hermes-obsidian-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-ocr-it-local-pdf-ocr-browser-extension-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-anthropic-fable-5-2-launch-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-physical-ai-with-raspberry-pi-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-fable-5-2-free-trial-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-skillopt-sleep-cycle-for-claude-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-bama-mac-app-rebuild-with-claude-code-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-fable-reset-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-crm-for-contractor-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-seo-backlinks-with-fable-5-2-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gemini-4-carbon-on-google-cloud-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-profit-boardroom-claude-obsidian-seo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-profit-boardroom-claudecodeagenticos-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-profit-boardroom-claude-whiteboards-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-connectors-demo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-street-view-blur-technique-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-tech-debt-skill-ai-code-audit-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-vllm-uc-berkeley-inference-server-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-video-editing-skills-ranking-security-warnings-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gemini-notebook-flashcard-upgrades-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-five-free-github-ai-tool-repos-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-landing-page-generation-pt-br-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-prompt-master-mod-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-four-claude-seo-tools-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-cli-anything-claude-integration-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-process-before-ai-framework-stopwatch-method-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-multi-agent-ai-workspace-with-group-chats-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-agent-os-step-5-preview-multi-agent-ai-wo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-ai-studio-update-gemini-omni-1-2-flash-fo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-skilltreeos-ai-agent-map-7-depts-34-teams-137-jo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-five-sign-up-tests-before-launch-localhost-googl-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-sabiql-terminal-db-client-driverless-postgres-sq-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-cloudflare-ai-security-agents-creating-false-pos-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-opus-5-5-agent-os-with-shared-memory-acro-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-chatgpt-images-2-6-upgrade-animated-gifs-brand-r-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gemini-omni-1-2-flash-ai-video-generation-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-harness-ownership-principle-rules-permissions-ch-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-nine-free-github-repos-as-paid-tool-alternatives-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-untangle-codebase-skill-for-claude-code-cleanup-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-youtube-agent-skill-free-ai-content-team-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-vibe-coding-supabase-open-access-rules-data-expo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-cloudflare-security-skill-auto-audits-systems-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-github-url-tricks-for-codebase-mapping-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-thermonuclear-code-quality-review-cursor-skill-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-fusion-embedding-multimodal-model-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-these-security-issues-are-gett-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-uh-oh-here-we-go-again-every-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-reverse-engineer-how-any-app-f-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-i-sat-by-the-river-bank-i-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-comment-projects-and-i-ll-se-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-found-a-php-hole-in-70-of-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-comment-need-if-you-want-the-l-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-build-an-ai-trading-team-with-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-you-already-have-an-ai-that-st-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:05Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-comment-community-to-build-all-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-2d-motion-interface-captionin-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-run-an-open-source-ai-agent-on-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-comment-edit-for-the-free-ki-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-how-to-improve-a-private-secur-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-this-tiny-robot-duck-costs-und-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-6-things-to-be-better-than-99-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-forecast-price-with-kronos-a-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-60-agents-on-one-build-run-fr-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-black-october-isn-t-over-part-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-general-motors-announced-some-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-minimax-h3-director-cut-studio-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-how-long-till-claude-books-me-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-meta-n-the-ai-that-codes-its-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-llm-wiki-skill-organizer-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-agentcraft-ai-agents-in-minecraft-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:06Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-kru-ai-agent-key-vault-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-native-v2-operating-system-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-agentos-complete-guide-mixture-of-agents-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-agentos-dashboard-demo-oracle-video-agent-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-uk-gdpr-data-broker-opt-out-via-single-bcc-email-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-learn-ai-automation-from-scratch-in-three-months-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-build-first-ai-agent-in-claude-code-step-by-step-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-crawlie-free-open-source-seo-crawler-in-rust-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-microsoft-hackers-using-ai-to-scan-github-for-az-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-content-system-for-product-visibility-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-obsidian-agentos-ai-assistant-with-person-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:07Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-07-reroute-free-only-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:08Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-10-omniroute-council-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:08Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-cloudflare-security-audit-skill-for-claude-code-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:08Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-three-claude-settings-for-business-plugins-conne-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:14Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for adoption-utilization-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:15Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-urbanground-testing-ai-in-rea-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:36:19Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-top-5-mcps-for-claude-perplexity-playwright-farc-20261119 cannot start safely
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: adoption-utilization-20261119 (unit adoption-utilization) no cycle output for 127 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: ai-stage2-business-os-20261115 (unit ai-stage2-business-os) no cycle output for 5837 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: fix-alerting-r1-20261115 (unit fix-alerting-r1) no cycle output for 5874 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: fix-backup-failover-r1-20261115 (unit fix-backup-failover-r1) no cycle output for 5890 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: fix-safety-screen-r1-20261115 (unit fix-safety-screen-r1) no cycle output for 5893 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: local-dell-qwen-trial-20261115 (unit local-dell-qwen-trial-r1) no cycle output for 5055 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: narrow-pilot-pack-20261116 (unit narrow-pilot-pack-r1) no cycle output for 4297 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: org-adopt-orphan-repos-20261116 (unit org-adopt-orphan-repos-r1) no cycle output for 4282 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: phone-stage2-maintenanceos-phone-line-20261115 (unit phone-stage2-maintenanceos-phone-line) no cycle output for 5836 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: phone-stage4-maintenanceos-phone-line-20261115 (unit phone-stage4-maintenanceos-phone-line) no cycle output for 5078 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: phone-stage5-maintenanceos-phone-line-20261115 (unit phone-stage5-maintenanceos-phone-line) no cycle output for 4996 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-13-layers-of-production-stack-20261118 (unit reel-adopt-13-layers-of-production-stack) no cycle output for 2303 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-48-laws-of-powerful-agents-20261117 (unit reel-adopt-48-laws-of-powerful-agents) no cycle output for 2898 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-agent-kill-switch-runbook-drill-20261117 (unit reel-adopt-agent-kill-switch-runbook-drill) no cycle output for 3415 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-ai-coding-agent-dependency-supply-chain-risk-20261118 (unit reel-adopt-ai-coding-agent-dependency-supply-chain-risk) no cycle output for 2552 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-ai-receptionist-demo-claude-code-retell-20261117 (unit reel-adopt-ai-receptionist-demo-claude-code-retell) no cycle output for 2924 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-ai-usage-cost-tracking-per-user-agent-20261117 (unit reel-adopt-ai-usage-cost-tracking-per-user-agent) no cycle output for 2299 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-anthropic-playbook-pattern-one-agent-playbook-pe-20261117 (unit reel-adopt-anthropic-playbook-pattern-one-agent-playbook-pe) no cycle output for 3258 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-anti-sycophancy-prompt-for-ai-settings-20261117 (unit reel-adopt-anti-sycophancy-prompt-for-ai-settings) no cycle output for 2833 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-bottleneck-theory-for-over-engineering-20261117 (unit reel-adopt-bottleneck-theory-for-over-engineering) no cycle output for 2682 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-cloudflare-ai-security-audit-skill-20261117 (unit reel-adopt-cloudflare-ai-security-audit-skill) no cycle output for 2566 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-cloudflare-ai-security-audit-skill-open-source-2-20261117 (unit reel-adopt-cloudflare-ai-security-audit-skill-open-source-2) no cycle output for 2870 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-cloudflare-security-audit-estate-repos-20261117 (unit reel-adopt-cloudflare-security-audit-estate-repos) no cycle output for 3331 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-cross-customer-data-separation-20261117 (unit reel-adopt-cross-customer-data-separation) no cycle output for 154 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-cybermes-autonomous-verified-security-agent-20261117 (unit reel-adopt-cybermes-autonomous-verified-security-agent) no cycle output for 2534 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-fable-5-2-progressive-disclosure-skills-insights-20261117 (unit reel-adopt-fable-5-2-progressive-disclosure-skills-insights) no cycle output for 2981 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-git-github-version-control-for-ai-coding-20261117 (unit reel-adopt-git-github-version-control-for-ai-coding) no cycle output for 2922 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-goldman-sachs-ai-governance-deloitte-accountabil-20261117 (unit reel-adopt-goldman-sachs-ai-governance-deloitte-accountabil) no cycle output for 2199 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-harness-ownership-principle-rules-permissions-ch-20261119 (unit reel-adopt-harness-ownership-principle-rules-permissions-ch) no cycle output for 1217 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-insurer-evidence-file-20261117 (unit reel-adopt-insurer-evidence-file) no cycle output for 3422 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-kru-ai-agent-key-vault-20261119 (unit reel-adopt-kru-ai-agent-key-vault) no cycle output for 459 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-local-vs-global-problems-methodology-20261117 (unit reel-adopt-local-vs-global-problems-methodology) no cycle output for 2820 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-lora-behaviour-trial-20261117 (unit reel-adopt-lora-behaviour-trial) no cycle output for 3375 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-microsoft-hackers-using-ai-to-scan-github-for-az-20261119 (unit reel-adopt-microsoft-hackers-using-ai-to-scan-github-for-az) no cycle output for 260 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-microsoft-outage-health-check-cascade-20261117 (unit reel-adopt-microsoft-outage-health-check-cascade) no cycle output for 2298 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-musk-5-step-building-algorithm-20261117 (unit reel-adopt-musk-5-step-building-algorithm) no cycle output for 2912 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-oauth-grant-inventory-20261117 (unit reel-adopt-oauth-grant-inventory) no cycle output for 3417 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-oauth-redirect-uri-validation-google-oauth-20261117 (unit reel-adopt-oauth-redirect-uri-validation-google-oauth) no cycle output for 3234 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-ocr-it-local-pdf-ocr-browser-extension-20261118 (unit reel-adopt-ocr-it-local-pdf-ocr-browser-extension) no cycle output for 1392 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-outcome-first-prompting-20261117 (unit reel-adopt-outcome-first-prompting) no cycle output for 2946 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-password-reset-poisoning-fix-20261117 (unit reel-adopt-password-reset-poisoning-fix) no cycle output for 3394 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-sandbox-lockdown-dell-agent-units-20261117 (unit reel-adopt-sandbox-lockdown-dell-agent-units) no cycle output for 3390 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-sellable-commercial-readiness-20261117 (unit reel-adopt-sellable-commercial-readiness) no cycle output for 3391 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-shadow-ai-usage-64-on-personal-accounts-20261117 (unit reel-adopt-shadow-ai-usage-64-on-personal-accounts) no cycle output for 2480 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-six-essential-documents-before-vibe-coding-20261117 (unit reel-adopt-six-essential-documents-before-vibe-coding) no cycle output for 2810 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-six-pillars-for-claude-code-business-repo-struct-20261117 (unit reel-adopt-six-pillars-for-claude-code-business-repo-struct) no cycle output for 2230 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-six-ui-ux-principles-for-product-design-20261117 (unit reel-adopt-six-ui-ux-principles-for-product-design) no cycle output for 2953 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-tech-debt-skill-ai-code-audit-github-ksimback-te-20261117 (unit reel-adopt-tech-debt-skill-ai-code-audit-github-ksimback-te) no cycle output for 1872 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-three-question-release-gate-20261117 (unit reel-adopt-three-question-release-gate) no cycle output for 3402 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-uk-gdpr-data-broker-opt-out-via-single-bcc-email-20261119 (unit reel-adopt-uk-gdpr-data-broker-opt-out-via-single-bcc-email) no cycle output for 232 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-vibe-coding-supabase-open-access-rules-data-expo-20261119 (unit reel-adopt-vibe-coding-supabase-open-access-rules-data-expo) no cycle output for 1095 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-vllm-uc-berkeley-open-source-inference-server-pa-20261117 (unit reel-adopt-vllm-uc-berkeley-open-source-inference-server-pa) no cycle output for 2689 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adopt-voice-cloning-tool-3-sec-audio-no-login-20261117 (unit reel-adopt-voice-cloning-tool-3-sec-audio-no-login) no cycle output for 2891 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-adoption-impact-outlook-20261117 (unit reel-adoption-impact-outlook) no cycle output for 3259 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-review-council-20261117-0916 (unit reel-review-council-20261117-0916) no cycle output for 3731 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-2d-motion-interface-captionin-20261119 (unit reel-trial-2d-motion-interface-captionin) no cycle output for 497 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-47-ai-agents-running-a-company-shared-brain-mode-20261118 (unit reel-trial-47-ai-agents-running-a-company-shared-brain-mode) no cycle output for 2212 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-6-things-to-be-better-than-99-20261119 (unit reel-trial-6-things-to-be-better-than-99) no cycle output for 712 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-60-agents-on-one-build-run-fr-20261119 (unit reel-trial-60-agents-on-one-build-run-fr) no cycle output for 729 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-agentcraft-ai-agents-in-minecraft-20261119 (unit reel-trial-agentcraft-ai-agents-in-minecraft) no cycle output for 504 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ai-automation-seo-social-media-content-engine-20261117 (unit reel-trial-ai-automation-seo-social-media-content-engine) no cycle output for 2113 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ai-content-system-for-product-visibility-20261119 (unit reel-trial-ai-content-system-for-product-visibility) no cycle output for 219 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ai-found-a-php-hole-in-70-of-20261119 (unit reel-trial-ai-found-a-php-hole-in-70-of) no cycle output for 816 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ai-invoice-clerk-copilot-studio-bank-change-frau-20261118 (unit reel-trial-ai-invoice-clerk-copilot-studio-bank-change-frau) no cycle output for 2224 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ai-landing-page-generation-pt-br-20261119 (unit reel-trial-ai-landing-page-generation-pt-br) no cycle output for 1133 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ai-native-v2-operating-system-20261119 (unit reel-trial-ai-native-v2-operating-system) no cycle output for 494 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ai-profit-boardroom-claude-obsidian-seo-20261119 (unit reel-trial-ai-profit-boardroom-claude-obsidian-seo) no cycle output for 1150 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ai-profit-boardroom-claude-whiteboards-20261119 (unit reel-trial-ai-profit-boardroom-claude-whiteboards) no cycle output for 1312 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ai-profit-boardroom-claudecodeagenticos-20261119 (unit reel-trial-ai-profit-boardroom-claudecodeagenticos) no cycle output for 1187 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ambient-context-local-work-diary-for-ai-20261118 (unit reel-trial-ambient-context-local-work-diary-for-ai) no cycle output for 2328 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-anthropic-fable-5-2-launch-20261118 (unit reel-trial-anthropic-fable-5-2-launch) no cycle output for 1408 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-api-key-encryption-kms-pattern-plain-text-keys-i-20261118 (unit reel-trial-api-key-encryption-kms-pattern-plain-text-keys-i) no cycle output for 2152 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-audio8-speech-model-20261117 (unit reel-trial-audio8-speech-model) no cycle output for 3392 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-bama-mac-app-rebuild-with-claude-code-20261119 (unit reel-trial-bama-mac-app-rebuild-with-claude-code) no cycle output for 1389 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-black-mirror-method-self-cloning-with-claude-cod-20261118 (unit reel-trial-black-mirror-method-self-cloning-with-claude-cod) no cycle output for 2158 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-black-october-isn-t-over-part-20261119 (unit reel-trial-black-october-isn-t-over-part) no cycle output for 761 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-bookshelf-self-hosted-e-book-library-no-db-cloud-20261117 (unit reel-trial-bookshelf-self-hosted-e-book-library-no-db-cloud) no cycle output for 2180 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-browser-automation-opencli-turn-website-interact-20261118 (unit reel-trial-browser-automation-opencli-turn-website-interact) no cycle output for 1893 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-build-an-ai-trading-team-with-20261119 (unit reel-trial-build-an-ai-trading-team-with) no cycle output for 816 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-build-first-ai-agent-in-claude-code-step-by-step-20261119 (unit reel-trial-build-first-ai-agent-in-claude-code-step-by-step) no cycle output for 358 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-calibri-744b-model-on-cpu-disk-streaming-openai-20261117 (unit reel-trial-calibri-744b-model-on-cpu-disk-streaming-openai) no cycle output for 2283 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-chatgpt-images-2-6-upgrade-animated-gifs-brand-r-20261119 (unit reel-trial-chatgpt-images-2-6-upgrade-animated-gifs-brand-r) no cycle output for 1116 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-code-front-end-design-toolkit-70-tools-th-20261117 (unit reel-trial-claude-code-front-end-design-toolkit-70-tools-th) no cycle output for 1897 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-connectors-demo-20261119 (unit reel-trial-claude-connectors-demo) no cycle output for 1322 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-diagram-design-skill-58k-stars-flowcharts-20261118 (unit reel-trial-claude-diagram-design-skill-58k-stars-flowcharts) no cycle output for 2231 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-mods-prompt-rewriting-agent-chat-linking-20261118 (unit reel-trial-claude-mods-prompt-rewriting-agent-chat-linking) no cycle output for 1877 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-opus-5-5-agent-os-with-shared-memory-acro-20261119 (unit reel-trial-claude-opus-5-5-agent-os-with-shared-memory-acro) no cycle output for 1143 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-paper-skill-local-ocr-on-device-free-20261117 (unit reel-trial-claude-paper-skill-local-ocr-on-device-free) no cycle output for 2078 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-prompt-master-mod-20261119 (unit reel-trial-claude-prompt-master-mod) no cycle output for 1106 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-red-free-open-source-security-playbooks-f-20261118 (unit reel-trial-claude-red-free-open-source-security-playbooks-f) no cycle output for 2284 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-security-anti-patterns-api-key-front-end-20261118 (unit reel-trial-claude-security-anti-patterns-api-key-front-end) no cycle output for 2231 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-claude-skills-short-files-standardizing-agent-be-20261118 (unit reel-trial-claude-skills-short-files-standardizing-agent-be) no cycle output for 2424 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-cli-anything-claude-integration-20261119 (unit reel-trial-cli-anything-claude-integration) no cycle output for 1117 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-cloudflare-ai-security-agents-creating-false-pos-20261119 (unit reel-trial-cloudflare-ai-security-agents-creating-false-pos) no cycle output for 1139 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-cloudflare-security-skill-auto-audits-systems-20261119 (unit reel-trial-cloudflare-security-skill-auto-audits-systems) no cycle output for 983 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-codejury-two-model-jury-ai-code-review-20261117 (unit reel-trial-codejury-two-model-jury-ai-code-review) no cycle output for 3209 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-comment-community-to-build-all-20261119 (unit reel-trial-comment-community-to-build-all) no cycle output for 810 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-comment-edit-for-the-free-ki-20261119 (unit reel-trial-comment-edit-for-the-free-ki) no cycle output for 523 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-comment-need-if-you-want-the-l-20261119 (unit reel-trial-comment-need-if-you-want-the-l) no cycle output for 774 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-comment-projects-and-i-ll-se-20261119 (unit reel-trial-comment-projects-and-i-ll-se) no cycle output for 816 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-context-mode-plugin-for-claude-code-20261117 (unit reel-trial-context-mode-plugin-for-claude-code) no cycle output for 3238 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-crawlie-free-open-source-seo-crawler-in-rust-20261119 (unit reel-trial-crawlie-free-open-source-seo-crawler-in-rust) no cycle output for 344 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-crm-for-contractor-20261119 (unit reel-trial-crm-for-contractor) no cycle output for 1352 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-fable-5-2-free-trial-20261118 (unit reel-trial-fable-5-2-free-trial) no cycle output for 1378 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-fable-reset-20261119 (unit reel-trial-fable-reset) no cycle output for 1359 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-five-free-github-ai-tool-repos-20261119 (unit reel-trial-five-free-github-ai-tool-repos) no cycle output for 1103 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-forecast-price-with-kronos-a-20261119 (unit reel-trial-forecast-price-with-kronos-a) no cycle output for 521 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-four-claude-seo-tools-20261119 (unit reel-trial-four-claude-seo-tools) no cycle output for 1033 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-from-bulk-20261118 (unit reel-trial-from-bulk) no cycle output for 1366 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-fusion-embedding-multimodal-model-20261119 (unit reel-trial-fusion-embedding-multimodal-model) no cycle output for 879 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-gal-central-ai-agent-config-manager-17-agents-ya-20261117 (unit reel-trial-gal-central-ai-agent-config-manager-17-agents-ya) no cycle output for 2163 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-gemini-4-carbon-on-google-cloud-20261119 (unit reel-trial-gemini-4-carbon-on-google-cloud) no cycle output for 1370 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-gemini-decision-1-fast-decision-model-yes-no-mul-20261118 (unit reel-trial-gemini-decision-1-fast-decision-model-yes-no-mul) no cycle output for 2360 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-gemini-notebook-flashcard-upgrades-20261119 (unit reel-trial-gemini-notebook-flashcard-upgrades) no cycle output for 1148 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-gemini-omni-1-2-flash-ai-video-generation-20261119 (unit reel-trial-gemini-omni-1-2-flash-ai-video-generation) no cycle output for 1084 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-general-motors-announced-some-20261119 (unit reel-trial-general-motors-announced-some) no cycle output for 760 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-github-url-tricks-for-codebase-mapping-20261119 (unit reel-trial-github-url-tricks-for-codebase-mapping) no cycle output for 953 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-google-ai-studio-update-gemini-omni-1-2-flash-fo-20261119 (unit reel-trial-google-ai-studio-update-gemini-omni-1-2-flash-fo) no cycle output for 1066 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-google-antigravity-2-32-0-swarm-dynamic-workflow-20261118 (unit reel-trial-google-antigravity-2-32-0-swarm-dynamic-workflow) no cycle output for 2256 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-google-antigravity-browser-agent-browse-build-te-20261118 (unit reel-trial-google-antigravity-browser-agent-browse-build-te) no cycle output for 2217 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-google-antigravity-voice-mode-remote-agents-slas-20261118 (unit reel-trial-google-antigravity-voice-mode-remote-agents-slas) no cycle output for 2225 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-google-street-view-blur-technique-20261119 (unit reel-trial-google-street-view-blur-technique) no cycle output for 1182 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-hallmark-design-skill-together-ai-50-themes-755-20261117 (unit reel-trial-hallmark-design-skill-together-ai-50-themes-755) no cycle output for 3230 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-heimdall-local-persistent-ai-agent-brain-zero-to-20261117 (unit reel-trial-heimdall-local-persistent-ai-agent-brain-zero-to) no cycle output for 2118 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-hermes-agent-6-levels-hearth-release-1650-change-20261118 (unit reel-trial-hermes-agent-6-levels-hearth-release-1650-change) no cycle output for 2391 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-hermes-agent-os-step-5-preview-multi-agent-ai-wo-20261119 (unit reel-trial-hermes-agent-os-step-5-preview-multi-agent-ai-wo) no cycle output for 1024 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-hermes-agentos-complete-guide-mixture-of-agents-20261119 (unit reel-trial-hermes-agentos-complete-guide-mixture-of-agents) no cycle output for 343 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-hermes-agentos-dashboard-demo-oracle-video-agent-20261119 (unit reel-trial-hermes-agentos-dashboard-demo-oracle-video-agent) no cycle output for 391 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-hermes-multi-agent-ai-workspace-with-group-chats-20261119 (unit reel-trial-hermes-multi-agent-ai-workspace-with-group-chats) no cycle output for 940 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-hermes-obsidian-agentos-ai-assistant-with-person-20261119 (unit reel-trial-hermes-obsidian-agentos-ai-assistant-with-person) no cycle output for 233 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-hermes-obsidian-shared-memory-for-ai-agents-20261118 (unit reel-trial-hermes-obsidian-shared-memory-for-ai-agents) no cycle output for 2218 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-how-long-till-claude-books-me-20261119 (unit reel-trial-how-long-till-claude-books-me) no cycle output for 507 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-how-to-improve-a-private-secur-20261119 (unit reel-trial-how-to-improve-a-private-secur) no cycle output for 742 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-hyperframes-code-to-video-via-claude-code-20261117 (unit reel-trial-hyperframes-code-to-video-via-claude-code) no cycle output for 2741 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-i-sat-by-the-river-bank-i-20261119 (unit reel-trial-i-sat-by-the-river-bank-i) no cycle output for 831 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-jane-street-socratic-tutor-free-claude-skill-ada-20261117 (unit reel-trial-jane-street-socratic-tutor-free-claude-skill-ada) no cycle output for 2229 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-kern-rootless-sandbox-3ms-20261117 (unit reel-trial-kern-rootless-sandbox-3ms) no cycle output for 2683 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-latticedb-local-graph-semantic-text-db-zig-singl-20261117 (unit reel-trial-latticedb-local-graph-semantic-text-db-zig-singl) no cycle output for 425 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-learn-ai-automation-from-scratch-in-three-months-20261119 (unit reel-trial-learn-ai-automation-from-scratch-in-three-months) no cycle output for 381 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-llm-wiki-skill-organizer-20261119 (unit reel-trial-llm-wiki-skill-organizer) no cycle output for 511 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-lp-skill-design-principles-nielsen-gestalt-fitts-20261118 (unit reel-trial-lp-skill-design-principles-nielsen-gestalt-fitts) no cycle output for 2225 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-mailflare-self-hosted-google-workspace-alt-with-20261118 (unit reel-trial-mailflare-self-hosted-google-workspace-alt-with) no cycle output for 2240 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-matt-pocock-skills-for-real-engineers-claude-cod-20261117 (unit reel-trial-matt-pocock-skills-for-real-engineers-claude-cod) no cycle output for 2204 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-mesh-llm-distributed-llm-inference-20261117 (unit reel-trial-mesh-llm-distributed-llm-inference) no cycle output for 3236 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-meta-asterix-design-system-150-components-mcp-se-20261117 (unit reel-trial-meta-asterix-design-system-150-components-mcp-se) no cycle output for 3229 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-meta-n-the-ai-that-codes-its-20261119 (unit reel-trial-meta-n-the-ai-that-codes-its) no cycle output for 507 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-minimax-h3-director-cut-studio-20261119 (unit reel-trial-minimax-h3-director-cut-studio) no cycle output for 505 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-nine-free-github-repos-as-paid-tool-alternatives-20261119 (unit reel-trial-nine-free-github-repos-as-paid-tool-alternatives) no cycle output for 1111 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-notion-ai-second-brain-template-for-agents-20261117 (unit reel-trial-notion-ai-second-brain-template-for-agents) no cycle output for 2217 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-numbat-model-malware-warning-oathbreaker-advocac-20261118 (unit reel-trial-numbat-model-malware-warning-oathbreaker-advocac) no cycle output for 2523 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-ocr-it-local-pdf-ocr-browser-extension-20261117 (unit reel-trial-ocr-it-local-pdf-ocr-browser-extension) no cycle output for 2965 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-omega-agent-orchestration-opus-plans-haiku-execu-20261118 (unit reel-trial-omega-agent-orchestration-opus-plans-haiku-execu) no cycle output for 2198 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-open-source-voice-cloning-local-cpu-7-sec-clone-20261117 (unit reel-trial-open-source-voice-cloning-local-cpu-7-sec-clone) no cycle output for 3006 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-openai-businesses-in-chatgpt-business-hub-busine-20261118 (unit reel-trial-openai-businesses-in-chatgpt-business-hub-busine) no cycle output for 2264 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-openai-dots-always-on-ai-agents-with-own-compute-20261118 (unit reel-trial-openai-dots-always-on-ai-agents-with-own-compute) no cycle output for 2215 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-physical-ai-with-raspberry-pi-20261118 (unit reel-trial-physical-ai-with-raspberry-pi) no cycle output for 1364 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-pibench-ai-coding-agent-benchmark-real-bugs-sand-20261118 (unit reel-trial-pibench-ai-coding-agent-benchmark-real-bugs-sand) no cycle output for 2207 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-process-before-ai-framework-stopwatch-method-20261119 (unit reel-trial-process-before-ai-framework-stopwatch-method) no cycle output for 1016 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-reverse-engineer-how-any-app-f-20261119 (unit reel-trial-reverse-engineer-how-any-app-f) no cycle output for 521 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-run-an-open-source-ai-agent-on-20261119 (unit reel-trial-run-an-open-source-ai-agent-on) no cycle output for 759 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-sabiql-terminal-db-client-driverless-postgres-sq-20261119 (unit reel-trial-sabiql-terminal-db-client-driverless-postgres-sq) no cycle output for 1103 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-seo-backlinks-with-fable-5-2-20261119 (unit reel-trial-seo-backlinks-with-fable-5-2) no cycle output for 1379 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-shared-ai-agent-memory-hermes-obsidian-20261118 (unit reel-trial-shared-ai-agent-memory-hermes-obsidian) no cycle output for 1414 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-skillopt-sleep-cycle-for-claude-20261119 (unit reel-trial-skillopt-sleep-cycle-for-claude) no cycle output for 1116 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-skilltreeos-ai-agent-map-7-depts-34-teams-137-jo-20261119 (unit reel-trial-skilltreeos-ai-agent-map-7-depts-34-teams-137-jo) no cycle output for 1148 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-slashbrag-launch-video-skill-for-coding-agents-20261117 (unit reel-trial-slashbrag-launch-video-skill-for-coding-agents) no cycle output for 2116 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-tech-debt-skill-ai-code-audit-20261119 (unit reel-trial-tech-debt-skill-ai-code-audit) no cycle output for 1307 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-terminal-phone-iphone-in-terminal-ai-agent-contr-20261117 (unit reel-trial-terminal-phone-iphone-in-terminal-ai-agent-contr) no cycle output for 2539 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-thermonuclear-code-quality-review-cursor-skill-20261119 (unit reel-trial-thermonuclear-code-quality-review-cursor-skill) no cycle output for 976 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-these-security-issues-are-gett-20261119 (unit reel-trial-these-security-issues-are-gett) no cycle output for 516 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-this-tiny-robot-duck-costs-und-20261119 (unit reel-trial-this-tiny-robot-duck-costs-und) no cycle output for 497 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-three-claude-settings-for-business-plugins-conne-20261119 (unit reel-trial-three-claude-settings-for-business-plugins-conne) no cycle output for 219 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-top-10-mcp-servers-ranking-20261117 (unit reel-trial-top-10-mcp-servers-ranking) no cycle output for 2986 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-tradingagents-multi-agent-adversarial-pattern-20261117 (unit reel-trial-tradingagents-multi-agent-adversarial-pattern) no cycle output for 2281 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-twil-8b-vs-qwen-20261117 (unit reel-trial-twil-8b-vs-qwen) no cycle output for 3310 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-uh-oh-here-we-go-again-every-20261119 (unit reel-trial-uh-oh-here-we-go-again-every) no cycle output for 518 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-untangle-codebase-skill-for-claude-code-cleanup-20261119 (unit reel-trial-untangle-codebase-skill-for-claude-code-cleanup) no cycle output for 1008 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-video-editing-skills-ranking-security-warnings-20261119 (unit reel-trial-video-editing-skills-ranking-security-warnings) no cycle output for 1101 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-vllm-uc-berkeley-inference-server-20261119 (unit reel-trial-vllm-uc-berkeley-inference-server) no cycle output for 1113 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-voice-agent-approval-workflow-claudecode-fish-au-20261117 (unit reel-trial-voice-agent-approval-workflow-claudecode-fish-au) no cycle output for 3254 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-you-already-have-an-ai-that-st-20261119 (unit reel-trial-you-already-have-an-ai-that-st) no cycle output for 733 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: reel-trial-youtube-agent-skill-free-ai-content-team-20261119 (unit reel-trial-youtube-agent-skill-free-ai-content-team) no cycle output for 1143 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: rescore-12-products-20261116 (unit rescore-12-products-r1) no cycle output for 148 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: root-cause-safeguards-open-items-20261117 (unit root-cause-safeguards-open-items) no cycle output for 2961 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: sbom-vuln-scan-20261115 (unit sbom-vuln-scan-r1) no cycle output for 5852 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: scaffold-upgrade-20261115 (unit scaffold-upgrade-r1) no cycle output for 5832 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: scaffolding-teardown-20261116 (unit scaffolding-teardown-r1) no cycle output for 4304 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: secrets-vault-rotate-20261116 (unit secrets-vault-rotate-r1) no cycle output for 4258 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: shadow-gdpr-accountability-20261116 (unit shadow-gdpr-accountability-r1) no cycle output for 5168 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: shadow-iso27001-20261116 (unit shadow-iso27001-r1) no cycle output for 5142 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: shadow-iso9001-20261116 (unit shadow-iso9001-r1) no cycle output for 5142 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: shadow-owasp-asvs-l2-20261116 (unit shadow-owasp-asvs-l2-r1) no cycle output for 5147 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: shadow-soc2-tsc-20261116 (unit shadow-soc2-tsc-r1) no cycle output for 5170 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: shadow-standards-68-20261116 (unit shadow-standards-68-r1) no cycle output for 5155 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: shadow-wcag22aa-20261116 (unit shadow-wcag22aa-r1) no cycle output for 5149 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: tender-dry-run-20261115 (unit tender-dry-run-r1) no cycle output for 5890 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: tool-agent-orchestration-r1-20261115 (unit tool-agent-orchestration-r1) no cycle output for 5924 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: tool-cost-tuning-r1-20261115 (unit tool-cost-tuning-r1) no cycle output for 5858 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: tool-synthetic-data-r1-20261115 (unit tool-synthetic-data-r1) no cycle output for 6100 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: trading-bot-ai-agent-20261116 (unit trading-bot-ai-agent-r1) no cycle output for 4514 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: video-intake-fix-20261116 (unit video-intake-fix-r1) no cycle output for 4537 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: video-skill-install-20261116 (unit video-skill-install-r1) no cycle output for 4574 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: website-council-deploy-20261116 (unit website-council-deploy-r1) no cycle output for 4289 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: website-council-fit-20261115 (unit website-council-fit-r1) no cycle output for 5888 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: website-council-specialist-20261116 (unit website-council-specialist-r2) no cycle output for 5138 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: welsh-pilot-pitch-20261117 (unit welsh-pilot-pitch-r1) no cycle output for 4249 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: wirral-structural-repairs-competitor-research-20261115 (unit wirral-structural-repairs-competitor-research-r1) no cycle output for 5860 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: wirral-structural-repairs-local-seo-website-20261115 (unit wirral-structural-repairs-local-seo-website-r1) no cycle output for 5179 min
- 2026-11-19 23:37 GMT STALE-CHECK: HUNG: wirral-structural-repairs-seo-phase2-20261116 (unit wirral-structural-repairs-seo-phase2-r1) no cycle output for 123 min
- 2026-11-19 23:37 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-19 23:37 GMT STALE-CHECK: FAILING-FAST: ln-04-combo-429-20261119 (unit ln-04-combo-429)

### MODEL PREFLIGHT 2026-11-19T23:37:09Z
- model 'mistral/codestral-latest' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-20-first-cycle-size-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:37:48Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-improvements-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:38:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-16-model-preflight-live-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:38:46Z
- model 'mistral/codestral-latest' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-14-taskdir-tests-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:38:46Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for persona-round-holiday-let-operator-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:38:46Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 11-council-minutes cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:38:46Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-23-six-docs-unstick-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:39:01Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-security-programme-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:39:28Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for housing-compliance-vault-v1-tables-row-level-security-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:39:28Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-13-plugin-guard-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:40:04Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tutorial-benchmark-rework-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:40:51Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-vercel-agent-browser-ai-agent-testing-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:41:02Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for website-reposition-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:41:03Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-video-production-course-7-step-line-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:42:56Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for persona-round-information-rights-complaints-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:44:10Z
- model 'groq/openai/gpt-oss-120b' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for droplet-carry-legal-case-management-build cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:45:56Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-vercel-agent-browser-ai-agent-testing-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:02Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 10-business-evidence-wallet cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:02Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 06-research-ai-test-pipelines cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:02Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ai-stage2-business-os-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:02Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for phone-stage2-maintenanceos-phone-line-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ai-stage2-holiday-let-operator-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for fix-safety-screen-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for fix-backup-failover-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for fix-alerting-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tool-synthetic-data-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tool-agent-orchestration-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tool-cost-tuning-r1-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for scaffold-upgrade-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tender-dry-run-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for sbom-vuln-scan-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for website-council-fit-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for local-dell-qwen-trial-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:03Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for wirral-structural-repairs-local-seo-website-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for wirral-structural-repairs-competitor-research-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for website-council-specialist-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for lumi-item4-synthetic-audio-render-20261111 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-iso27001-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-owasp-asvs-l2-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-wcag22aa-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-gdpr-accountability-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-soc2-tsc-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-iso9001-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for shadow-standards-68-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for phone-stage4-maintenanceos-phone-line-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for phone-stage5-maintenanceos-phone-line-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for video-skill-install-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for wirral-structural-repairs-seo-phase2-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for video-intake-fix-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for trading-bot-ai-agent-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for rescore-12-products-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for scaffolding-teardown-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for outsider-redteam-review-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for org-adopt-orphan-repos-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for secrets-vault-rotate-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for website-council-deploy-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for narrow-pilot-pack-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for welsh-pilot-pitch-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:05Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-review-council-20261117-0916 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cloudflare-security-audit-estate-repos-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-password-reset-poisoning-fix-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-sandbox-lockdown-dell-agent-units-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-agent-kill-switch-runbook-drill-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cross-customer-data-separation-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-insurer-evidence-file-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-three-question-release-gate-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-lora-behaviour-trial-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-sellable-commercial-readiness-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:06Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-oauth-grant-inventory-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:07Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-audio8-speech-model-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:07Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-twil-8b-vs-qwen-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:07Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-mesh-llm-distributed-llm-inference-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:07Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-voice-agent-approval-workflow-claudecode-fish-au-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:07Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-meta-asterix-design-system-150-components-mcp-se-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:07Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adoption-impact-outlook-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:07Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-anthropic-playbook-pattern-one-agent-playbook-pe-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:07Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-context-mode-plugin-for-claude-code-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:07Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-oauth-redirect-uri-validation-google-oauth-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-codejury-two-model-jury-ai-code-review-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hallmark-design-skill-together-ai-50-themes-755-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-voice-cloning-tool-3-sec-audio-no-login-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-automation-seo-social-media-content-engine-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-six-ui-ux-principles-for-product-design-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-six-essential-documents-before-vibe-coding-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-top-10-mcp-servers-ranking-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-fable-5-2-progressive-disclosure-skills-insights-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for root-cause-safeguards-open-items-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ocr-it-local-pdf-ocr-browser-extension-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-open-source-voice-cloning-local-cpu-7-sec-clone-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:08Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hyperframes-code-to-video-via-claude-code-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-outcome-first-prompting-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-git-github-version-control-for-ai-coding-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-ai-receptionist-demo-claude-code-retell-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-musk-5-step-building-algorithm-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cloudflare-ai-security-audit-skill-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cybermes-autonomous-verified-security-agent-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-anti-sycophancy-prompt-for-ai-settings-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-local-vs-global-problems-methodology-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-bottleneck-theory-for-over-engineering-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-48-laws-of-powerful-agents-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:09Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-kern-rootless-sandbox-3ms-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-shadow-ai-usage-64-on-personal-accounts-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-ai-usage-cost-tracking-per-user-agent-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-microsoft-outage-health-check-cascade-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-six-pillars-for-claude-code-business-repo-struct-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-vllm-uc-berkeley-open-source-inference-server-pa-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-tech-debt-skill-ai-code-audit-github-ksimback-te-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-goldman-sachs-ai-governance-deloitte-accountabil-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-heimdall-local-persistent-ai-agent-brain-zero-to-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-terminal-phone-iphone-in-terminal-ai-agent-contr-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-matt-pocock-skills-for-real-engineers-claude-cod-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-bookshelf-self-hosted-e-book-library-no-db-cloud-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-code-front-end-design-toolkit-70-tools-th-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gal-central-ai-agent-config-manager-17-agents-ya-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-latticedb-local-graph-semantic-text-db-zig-singl-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-cloudflare-ai-security-audit-skill-open-source-2-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-paper-skill-local-ocr-on-device-free-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-calibri-744b-model-on-cpu-disk-streaming-openai-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:10Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-jane-street-socratic-tutor-free-claude-skill-ada-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-notion-ai-second-brain-template-for-agents-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-tradingagents-multi-agent-adversarial-pattern-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-slashbrag-launch-video-skill-for-coding-agents-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-numbat-model-malware-warning-oathbreaker-advocac-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ambient-context-local-work-diary-for-ai-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-ai-coding-agent-dependency-supply-chain-risk-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-lp-skill-design-principles-nielsen-gestalt-fitts-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-13-layers-of-production-stack-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-obsidian-shared-memory-for-ai-agents-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:11Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-mailflare-self-hosted-google-workspace-alt-with-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-red-free-open-source-security-playbooks-f-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-black-mirror-method-self-cloning-with-claude-cod-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-omega-agent-orchestration-opus-plans-haiku-execu-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-antigravity-2-32-0-swarm-dynamic-workflow-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-skills-short-files-standardizing-agent-be-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-47-ai-agents-running-a-company-shared-brain-mode-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-mods-prompt-rewriting-agent-chat-linking-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-pibench-ai-coding-agent-benchmark-real-bugs-sand-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-security-anti-patterns-api-key-front-end-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gemini-decision-1-fast-decision-model-yes-no-mul-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-antigravity-browser-agent-browse-build-te-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-openai-businesses-in-chatgpt-business-hub-busine-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-antigravity-voice-mode-remote-agents-slas-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-agent-6-levels-hearth-release-1650-change-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-invoice-clerk-copilot-studio-bank-change-frau-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-diagram-design-skill-58k-stars-flowcharts-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-openai-dots-always-on-ai-agents-with-own-compute-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-browser-automation-opencli-turn-website-interact-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-api-key-encryption-kms-pattern-plain-text-keys-i-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:12Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-from-bulk-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-shared-ai-agent-memory-hermes-obsidian-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-ocr-it-local-pdf-ocr-browser-extension-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-anthropic-fable-5-2-launch-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-physical-ai-with-raspberry-pi-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-fable-5-2-free-trial-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-skillopt-sleep-cycle-for-claude-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-bama-mac-app-rebuild-with-claude-code-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-seo-backlinks-with-fable-5-2-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-fable-reset-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-crm-for-contractor-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-profit-boardroom-claudecodeagenticos-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-profit-boardroom-claude-whiteboards-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gemini-4-carbon-on-google-cloud-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-profit-boardroom-claude-obsidian-seo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-street-view-blur-technique-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-connectors-demo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-tech-debt-skill-ai-code-audit-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-vllm-uc-berkeley-inference-server-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:13Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-video-editing-skills-ranking-security-warnings-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gemini-notebook-flashcard-upgrades-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-five-free-github-ai-tool-repos-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-landing-page-generation-pt-br-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-prompt-master-mod-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-four-claude-seo-tools-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-cli-anything-claude-integration-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-process-before-ai-framework-stopwatch-method-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-multi-agent-ai-workspace-with-group-chats-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-agent-os-step-5-preview-multi-agent-ai-wo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-google-ai-studio-update-gemini-omni-1-2-flash-fo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-skilltreeos-ai-agent-map-7-depts-34-teams-137-jo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-sabiql-terminal-db-client-driverless-postgres-sq-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:14Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-five-sign-up-tests-before-launch-localhost-googl-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-cloudflare-ai-security-agents-creating-false-pos-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-claude-opus-5-5-agent-os-with-shared-memory-acro-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-chatgpt-images-2-6-upgrade-animated-gifs-brand-r-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-gemini-omni-1-2-flash-ai-video-generation-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-nine-free-github-repos-as-paid-tool-alternatives-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-harness-ownership-principle-rules-permissions-ch-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-youtube-agent-skill-free-ai-content-team-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-untangle-codebase-skill-for-claude-code-cleanup-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-github-url-tricks-for-codebase-mapping-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-vibe-coding-supabase-open-access-rules-data-expo-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-cloudflare-security-skill-auto-audits-systems-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-thermonuclear-code-quality-review-cursor-skill-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-fusion-embedding-multimodal-model-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-these-security-issues-are-gett-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-uh-oh-here-we-go-again-every-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-i-sat-by-the-river-bank-i-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-reverse-engineer-how-any-app-f-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:15Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-comment-projects-and-i-ll-se-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-found-a-php-hole-in-70-of-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-comment-need-if-you-want-the-l-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-build-an-ai-trading-team-with-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-you-already-have-an-ai-that-st-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-comment-community-to-build-all-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-2d-motion-interface-captionin-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-run-an-open-source-ai-agent-on-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-comment-edit-for-the-free-ki-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-how-to-improve-a-private-secur-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-this-tiny-robot-duck-costs-und-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-6-things-to-be-better-than-99-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-forecast-price-with-kronos-a-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-60-agents-on-one-build-run-fr-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-general-motors-announced-some-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:16Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-black-october-isn-t-over-part-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-minimax-h3-director-cut-studio-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-meta-n-the-ai-that-codes-its-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-agentcraft-ai-agents-in-minecraft-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-llm-wiki-skill-organizer-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-how-long-till-claude-books-me-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-kru-ai-agent-key-vault-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-native-v2-operating-system-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-agentos-complete-guide-mixture-of-agents-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-agentos-dashboard-demo-oracle-video-agent-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-learn-ai-automation-from-scratch-in-three-months-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-uk-gdpr-data-broker-opt-out-via-single-bcc-email-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-build-first-ai-agent-in-claude-code-step-by-step-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-crawlie-free-open-source-seo-crawler-in-rust-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-microsoft-hackers-using-ai-to-scan-github-for-az-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:17Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-ai-content-system-for-product-visibility-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:18Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-hermes-obsidian-agentos-ai-assistant-with-person-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:18Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-07-reroute-free-only-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:18Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-10-omniroute-council-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:18Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-cloudflare-security-audit-skill-for-claude-code-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:18Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-three-claude-settings-for-business-plugins-conne-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:24Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for adoption-utilization-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:25Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-urbanground-testing-ai-in-rea-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:30Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-top-5-mcps-for-claude-perplexity-playwright-farc-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:41Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ai-stage3-holiday-let-operator-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:42Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for router-outage-fixes-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:52Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-redcell-ai-pentesting-agent-recon-cve-prompt-inj-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:53Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-jarvis-agent-os-running-100-locally-on-mac-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:53Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-openinbox-free-email-tool-on-cloudflare-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:53Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-private-rag-on-mac-with-ollama-anythingllm-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:46:54Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-rag-pdf-question-answering-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:47:01Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-five-mcp-connectors-for-claude-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:47:42Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for persona-round-public-sector-citizen-agent-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:48:00Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for landlord-os-onboarding-evidence-tenancy-binding-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:48:01Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-review-council-20261119-2207 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:49:54Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-release-gate-checklist-and-oauth-dashboard-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:50:53Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for qwen-summaries-only-routing-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:50:54Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-agent-failure-log-compliance-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:50:54Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-mass-assignment-vulnerability-is-admin-field-inj-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:50:55Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-secure-ai-apps-data-server-server-side-auth-secr-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:51:00Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-12-router-failover-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:51:00Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-automation-audit-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:51:01Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-trial-vercel-agent-browser-shakedown-20261117 cannot start safely
- 2026-11-19 23:52 GMT STALE-CHECK: HUNG: ai-stage2-holiday-let-operator-20261115 (unit ai-stage2-holiday-let-operator) no cycle output for 125 min
- 2026-11-19 23:52 GMT STALE-CHECK: HUNG: outsider-redteam-review-20261116 (unit outsider-redteam-review-r1) no cycle output for 128 min
- 2026-11-19 23:52 GMT STALE-CHECK: HUNG: reel-trial-vercel-agent-browser-ai-agent-testing-20261117 (unit reel-trial-vercel-agent-browser-ai-agent-testing) no cycle output for 234 min
- 2026-11-19 23:52 GMT STALE-CHECK: FAILING-FAST: ef-model-lane-20261119 (unit ef-model-lane)
- 2026-11-19 23:52 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)

### MODEL PREFLIGHT 2026-11-19T23:52:23Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for model-test cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:53:58Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle cannot start safely
2026-11-19 23:54:23 UTC PLUGIN-GUARD: Disabled broken plugin 'heimdall' (moved to /tmp/opencode-smoke-test-config/plugins-disabled/heimdall.js.1795132463) - contained pattern: addOutput
2026-11-19 23:54:23 UTC PLUGIN-GUARD: Pre-cycle smoke test detected and disabled broken plugin(s) in /tmp/opencode-smoke-test-config/plugins

### MODEL PREFLIGHT 2026-11-19T23:54:24Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for failed-units-triage-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:24Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-adopt-mythos-5-2-ai-security-testing-finds-12-vuln-cla-20261117 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:25Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for business-evidence-wallet-preview-secret-history-exposure-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:25Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-improvements-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:25Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-security-programme-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:26Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for tutorial-follow-along-holes-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:26Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 09-housing-compliance-vault cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:26Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for persona-round-holiday-let-operator-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:26Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-dependency-vulnerability-audit-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:26Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ef-disk-guard-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:27Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 11-council-minutes cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:27Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for pentagi-emergency-stop-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:54:43Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-06-reorder-free-route-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:55:45Z
- model 'testjob' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-coding cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:04Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 04-maintenanceos-website cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:21Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for reel-scrape-speedup-20261118 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:27Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 05-legal-case-management cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:28Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 05-pins-canary-cost-alerts-orchestrator cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:28Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 08-holiday-let-operator cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:28Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for persona-round-chapelgate-information-rights-20261116 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:28Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for 06-chapelgate-information-rights cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:28Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for phone-stage3-maintenanceos-phone-line-20261115 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:29Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-18-gate-tuning-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:29Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-password-reset-poisoning-sweep-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:29Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ef-ops-hardening-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:29Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for housing-compliance-vault-v1-tables-row-level-security-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:29Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-01-omni-db-guard-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:29Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-04-combo-429-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:30Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for droplet-carry-legal-case-management-build cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:30Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-17-filewatch-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:30Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for estate-rate-limiting-implementation-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:30Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for business-evidence-wallet-headers-csp-preview-secret-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:30Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for business-evidence-wallet-red-team-ssrf-crypto-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:30Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-21-nvidia-429-schedule-20261119 cannot start safely

### MODEL PREFLIGHT 2026-11-19T23:56:30Z
- model 'estate-coding' missing/dead AND no live fallback (estate-coding free-only) in opencode's model list - cycle for ln-25-overnight-resilience-20261119 cannot start safely
- 2026-11-20 00:07 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 00:07 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 00:07 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 00:07 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 00:07 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-20 00:07 GMT STALE-CHECK: FAILING-FAST: ln-06-reorder-free-route-20261119 (unit ln-06-reorder-free-route)
- 2026-11-20 00:22 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 00:22 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 00:22 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 00:37 GMT STALE-CHECK: FAILING-FAST: ef-model-lane-20261119 (unit ef-model-lane)
- 2026-11-20 00:37 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 00:38 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 00:38 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 00:38 GMT STALE-CHECK: IDLE no unit, not finished: council-omniroute-review-20261117 (6h)
- 2026-11-20 00:52 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 00:52 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 00:52 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-20 00:52 GMT STALE-CHECK: IDLE no unit, not finished: third-party-pentest-research-20261115 (6h)
- 2026-11-20 00:52 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 01:07 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 01:07 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 01:10 GMT STALE-CHECK: HUNG: ln-07-reroute-free-only-20261119 (unit ln-07-reroute-free-only) no cycle output for 121 min
- 2026-11-20 01:10 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 01:10 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 01:10 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 01:10 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 01:22 GMT STALE-CHECK: HUNG: ln-10-omniroute-council-20261119 (unit ln-10-omniroute-council) no cycle output for 123 min
- 2026-11-20 01:22 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 01:37 GMT STALE-CHECK: HUNG: reel-adopt-five-sign-up-tests-before-launch-localhost-googl-20261119 (unit reel-adopt-five-sign-up-tests-before-launch-localhost-googl) no cycle output for 126 min
- 2026-11-20 01:37 GMT STALE-CHECK: HUNG: reel-trial-cloudflare-security-audit-skill-for-claude-code-20261119 (unit reel-trial-cloudflare-security-audit-skill-for-claude-code) no cycle output for 127 min
- 2026-11-20 01:37 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 01:37 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 01:37 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-20 01:37 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 01:52 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 01:52 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 01:52 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 01:52 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 01:52 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-20 02:07 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 02:07 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 02:07 GMT STALE-CHECK: IDLE no unit, not finished: estate-content-security-policy-inline-script-sweep-20261119 (6h)
- 2026-11-20 02:07 GMT STALE-CHECK: IDLE no unit, not finished: estate-oauth-grant-inventory-20261119 (6h)
- 2026-11-20 02:22 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 02:22 GMT STALE-CHECK: IDLE no unit, not finished: cyber-business-readiness-drafts-20261119 (6h)
- 2026-11-20 02:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-paperclip-ai-company-orchestrator-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 02:37 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 02:37 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 02:37 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 02:37 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 02:37 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 02:37 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: admin-preview-two-factor-enforcement-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: cyber-service-catalogue-draft-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: device-health-malware-audit-review-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: direct-approval-ledger-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: estate-secrets-vault-setup-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: grok-allowance-offload-check-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: information-rights-complaints-tesseract-tests-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: insurer-evidence-pack-review-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: product-source-of-truth-map-20261119 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: redteam15-r2-housing-compliance-vault-20261116 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: rl20-housing-compliance-vault-20261116 (6h)
- 2026-11-20 02:37 GMT STALE-CHECK: IDLE no unit, not finished: rl20-maintenanceos-website-20261116 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 02:52 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 02:52 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 02:52 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 02:52 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 02:52 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: business-insurance-cover-check-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: crest-check-accreditation-path-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: cyber-case-studies-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: cyber-competitor-list-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: cyber-partner-shortlist-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: cyber-pricing-benchmark-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: dell-docker-port-closure-prep-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: dell-single-point-of-failure-plan-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: docs-only-product-folders-markers-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: estate-done-claim-watcher-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: estate-readiness-claims-accuracy-audit-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: estate-red-team-first-run-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: estate-security-findings-dashboard-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: estate-shakedown-cloudflare-coverage-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: estate-test-environment-repair-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: housing-compliance-vault-migration-browser-tests-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: ico-registration-check-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: iso-27001-roadmap-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: mac-studio-firewall-prep-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: pentagi-authentication-unblock-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: priority-client-security-offers-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: public-sector-buying-routes-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: repair-pull-requests-merge-readiness-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: security-reel-knowledge-base-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: shared-security-component-library-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: staging-production-credentials-separation-20261119 (6h)
- 2026-11-20 02:52 GMT STALE-CHECK: IDLE no unit, not finished: sudo-least-privilege-plan-20261119 (6h)
- 2026-11-20 03:07 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 03:22 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 03:22 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 03:22 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 03:22 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 03:37 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 03:52 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 03:52 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-20 04:02 GMT reel adoption: TRIAL DfZ4TFtN_lI (AI video production course 7-step line) shipped, check passed.
- 2026-11-20 04:07 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 04:07 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 04:07 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 04:07 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 04:07 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 04:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-review-council-20261119-1507 (6h)
- 2026-11-20 04:22 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 04:22 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 04:22 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 04:37 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 04:37 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 04:52 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-20 05:07 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 05:07 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 05:07 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 05:07 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 05:22 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 05:22 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 05:37 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 05:37 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 05:37 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 05:37 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 05:52 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-20 05:52 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 05:52 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-20 06:07 GMT STALE-CHECK: FAILING-FAST: ln-03-fallthrough-20261119 (unit ln-03-fallthrough)
- 2026-11-20 06:07 GMT STALE-CHECK: FAILING-FAST: ln-08-staging-router-20261119 (unit ln-08-staging-router)
- 2026-11-20 06:07 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 06:07 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 06:07 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 06:07 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 06:22 GMT STALE-CHECK: FAILING-FAST: ln-14-taskdir-tests-20261119 (unit ln-14-taskdir-tests)
- 2026-11-20 06:37 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 06:37 GMT STALE-CHECK: FAILING-FAST: ln-15-jobs-tsv-audit-20261119 (unit ln-15-jobs-tsv-audit)
- 2026-11-20 06:37 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 06:37 GMT STALE-CHECK: FAILING-FAST: ln-24-private-lane-20261119 (unit ln-24-private-lane)
- 2026-11-20 09:46 GMT reel adoption: ADOPT Df0HSA8huc7 (Secure AI Apps: Data→Server, Server-Side Auth, Secrets→Server) shipped, check passed.
- 2026-11-20 09:46 GMT reel adoption: ADOPT Df0NEeSgWYI (Secure AI Apps: Data→Server, Server-Side Auth, Secrets→Server) shipped, check passed.
- 2026-11-20 09:51 GMT STALE-CHECK: dashboard STATUS.md not refreshed for 186 min
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: ai-stage2-holiday-let-operator-20261115 (12h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: ln-07-reroute-free-only-20261119 (10h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: ln-10-omniroute-council-20261119 (10h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: ln-19-session-retry-20261119 (8h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-cross-customer-data-separation-20261117 (12h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-five-sign-up-tests-before-launch-localhost-googl-20261119 (10h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-kru-ai-agent-key-vault-20261119 (17h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-microsoft-hackers-using-ai-to-scan-github-for-az-20261119 (14h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-uk-gdpr-data-broker-opt-out-via-single-bcc-email-20261119 (14h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-2d-motion-interface-captionin-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-6-things-to-be-better-than-99-20261119 (22h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-60-agents-on-one-build-run-fr-20261119 (22h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-agentcraft-ai-agents-in-minecraft-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-content-system-for-product-visibility-20261119 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-found-a-php-hole-in-70-of-20261119 (23h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-native-v2-operating-system-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-black-october-isn-t-over-part-20261119 (22h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-build-an-ai-trading-team-with-20261119 (23h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-build-first-ai-agent-in-claude-code-step-by-step-20261119 (16h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-cloudflare-security-audit-skill-for-claude-code-20261119 (10h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-comment-community-to-build-all-20261119 (23h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-comment-edit-for-the-free-ki-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-comment-need-if-you-want-the-l-20261119 (23h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-comment-projects-and-i-ll-se-20261119 (23h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-crawlie-free-open-source-seo-crawler-in-rust-20261119 (15h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-five-mcp-connectors-for-claude-20261117 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-forecast-price-with-kronos-a-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-general-motors-announced-some-20261119 (22h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-agentos-complete-guide-mixture-of-agents-20261119 (15h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-agentos-dashboard-demo-oracle-video-agent-20261119 (16h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-obsidian-agentos-ai-assistant-with-person-20261119 (14h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-how-long-till-claude-books-me-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-how-to-improve-a-private-secur-20261119 (22h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-jarvis-agent-os-running-100-locally-on-mac-20261119 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-latticedb-local-graph-semantic-text-db-zig-singl-20261117 (17h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-learn-ai-automation-from-scratch-in-three-months-20261119 (16h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-llm-wiki-skill-organizer-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-meta-n-the-ai-that-codes-its-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-minimax-h3-director-cut-studio-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-openinbox-free-email-tool-on-cloudflare-20261119 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-private-rag-on-mac-with-ollama-anythingllm-20261119 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-rag-pdf-question-answering-20261119 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-redcell-ai-pentesting-agent-recon-cve-prompt-inj-20261118 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-reverse-engineer-how-any-app-f-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-run-an-open-source-ai-agent-on-20261119 (22h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-these-security-issues-are-gett-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-this-tiny-robot-duck-costs-und-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-three-claude-settings-for-business-plugins-conne-20261119 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-top-5-mcps-for-claude-perplexity-playwright-farc-20261119 (14h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-uh-oh-here-we-go-again-every-20261119 (18h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-urbanground-testing-ai-in-rea-20261119 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-vercel-agent-browser-ai-agent-testing-20261117 (13h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-you-already-have-an-ai-that-st-20261119 (22h)
- 2026-11-20 09:51 GMT STALE-CHECK: IDLE no unit, not finished: wirral-structural-repairs-seo-phase2-20261116 (12h)
- 2026-11-20 09:52 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-20 10:29 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-20 11:28 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-20 11:28 GMT STALE-CHECK: GitHub token invalid
- 2026-11-20 11:28 GMT STALE-CHECK: Tailscale SOCKS 1055 DOWN
- 2026-11-20 11:43 GMT STALE-CHECK: suite table not refreshed for 15 min
- 2026-11-20 12:12 GMT STALE-CHECK: suite table not refreshed for 10 min
- 2026-11-20 12:20 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-20 12:25 GMT STALE-CHECK: IDLE no unit, not finished: business-evidence-wallet-preview-secret-history-exposure-20261119 (6h)
- 2026-11-20 12:25 GMT STALE-CHECK: IDLE no unit, not finished: housing-compliance-vault-v1-tables-row-level-security-20261119 (6h)
- 2026-11-20 12:25 GMT STALE-CHECK: IDLE no unit, not finished: rl20-housing-compliance-vault-20261116 (6h)
- 2026-11-20 12:42 GMT STALE-CHECK: Tailscale SOCKS 1055 DOWN
- 2026-11-20 12:42 GMT STALE-CHECK: IDLE no unit, not finished: estate-password-reset-poisoning-sweep-20261119 (6h)
- 2026-11-20 12:42 GMT STALE-CHECK: IDLE no unit, not finished: reel-scrape-speedup-20261118 (6h)
- 2026-11-20 12:42 GMT STALE-CHECK: IDLE no unit, not finished: rl20-maintenanceos-website-20261116 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: business-evidence-wallet-headers-csp-preview-secret-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: business-evidence-wallet-red-team-ssrf-crypto-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: council-root-disk-daily-20261120 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: data-separation-followup-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: estate-dependency-vulnerability-audit-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: estate-improvements-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: estate-rate-limiting-implementation-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: estate-security-programme-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: failed-units-triage-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: landlord-os-onboarding-evidence-tenancy-binding-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: pentagi-emergency-stop-20261119 (6h)
- 2026-11-20 12:54 GMT STALE-CHECK: IDLE no unit, not finished: redteam15-r2-housing-compliance-vault-20261116 (6h)
- 2026-11-20 13:24 GMT STALE-CHECK: FAILING-FAST: fix-safety-screen-r1-20261115 (unit fix-safety-screen-r1)
- 2026-11-20 14:07 GMT STALE-CHECK: FAILING-FAST: ln-02-swap-failure-20261119 (unit ln-02-swap-failure)
- 2026-11-20 14:07 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 14:07 GMT STALE-CHECK: FAILING-FAST: scaffold-upgrade-20261115 (unit scaffold-upgrade-r1)
- 2026-11-20 14:22 GMT STALE-CHECK: FAILING-FAST: fix-safety-screen-r1-20261115 (unit fix-safety-screen-r1)
- 20 Nov 2026 14:29 GMT | Dell root disk | disk-guard | root at 92% (57G free) | threshold 90%% active, move guard engaged; sqlite backup triggered; pauses new reel/council starts
- 20 Nov 2026 14:40 GMT | Dell root disk | disk-guard | root at 90% (68G free) | threshold 90% reached; pause pending at 95%; sqlite backup before 95%
- 2026-11-20 14:52 GMT STALE-CHECK: FAILING-FAST: fix-safety-screen-r1-20261115 (unit fix-safety-screen-r1)
- 2026-11-20 14:52 GMT STALE-CHECK: FAILING-FAST: shadow-iso9001-20261116 (unit shadow-iso9001-r1)
- 2026-11-20 15:07 GMT STALE-CHECK: FAILING-FAST: ln-11-container-reach-20261119 (unit ln-11-container-reach)
2026-11-20 15:08:35 UTC PLUGIN-GUARD: Disabled broken plugin 'heimdall' (moved to /tmp/opencode-smoke-test-config/plugins-disabled/heimdall.js.1795187315) - contained pattern: addOutput
2026-11-20 15:08:35 UTC PLUGIN-GUARD: Pre-cycle smoke test detected and disabled broken plugin(s) in /tmp/opencode-smoke-test-config/plugins
- 2026-11-20 15:22 GMT STALE-CHECK: FAILING-FAST: shadow-iso9001-20261116 (unit shadow-iso9001-r1)
- 2026-11-20 15:37 GMT STALE-CHECK: llama-server 8081 DOWN
### TAILSCALE KEY EXPIRY CHECK 2026-11-20 15:50:21 GMT
- OK SELF dell-t5820: tailscale key expires 2027-05-10T09:02:10Z (170 days left)
- OK PEER Andrew’s Mac Studio (macOS) online=True active=True: tailscale key expires 2027-05-07T16:42:09Z (168 days left)
- OK PEER localhost (iOS) online=True active=False: tailscale key expires 2027-04-20T21:04:51Z (151 days left)
- OK PEER CG (windows) online=True active=False: tailscale key expires 2027-04-20T21:03:52Z (151 days left)
- OK PEER cg-jobs (linux) online=False active=False: tailscale key expires 2027-04-20T22:25:56Z (151 days left)

- 2026-11-20 16:01:02 GMT | CRITICAL | build-complete | Test alert delivered via ALERTS.md fallback route (dell-t5820.taild4745e.ts.net). No email sender, no SMS - Mac lane needs browser re-auth, so fallback is used per BRIEF 35/36. | route: dell-watch/ALERTS.md | https://dell-t5820.taild4745e.ts.net
### TAILSCALE KEY EXPIRY CHECK 2026-11-20 16:05:08 GMT
- OK SELF dell-t5820: tailscale key expires 2027-05-10T09:02:10Z (170 days left)
- OK PEER Andrew’s Mac Studio (macOS) online=True active=True: tailscale key expires 2027-05-07T16:42:09Z (168 days left)
- OK PEER localhost (iOS) online=True active=False: tailscale key expires 2027-04-20T21:04:51Z (151 days left)
- OK PEER CG (windows) online=True active=False: tailscale key expires 2027-04-20T21:03:52Z (151 days left)
- OK PEER cg-jobs (linux) online=False active=False: tailscale key expires 2027-04-20T22:25:56Z (151 days left)

- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: ef-disk-guard-20261119 (unit ef-disk-guard)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: gcloud-add-hcv-20261120 (unit job-gcloud-add-hcv)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: improve-four-20261120 (unit job-improve-four)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: ln-09-provider-health-20261119 (unit ln-09-provider-health)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: ln-13-plugin-guard-20261119 (unit ln-13-plugin-guard)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: ln-20-first-cycle-size-20261119 (unit ln-20-first-cycle-size)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: ops-foundations-20261120 (unit job-ops-foundations)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: reel-trial-60-agents-on-one-build-run-fr-20261119 (unit reel-trial-60-agents-on-one-build-run-fr)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: reel-trial-ai-website-builder-creating-3d-websites-from-sin-20261120 (unit reel-trial-ai-website-builder-creating-3d-websites-from-sin)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: rescore-12-products-20261116 (unit rescore-12-products-r1)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: rokoko-smartgloves-ii-20261120 (unit job-rokoko-smartgloves-ii-buy-research)
- 2026-11-20 16:07 GMT STALE-CHECK: FAILING-FAST: tutorial-benchmark-rework-20261118 (unit tutorial-benchmark-rework)
- 2026-11-20 16:10 GMT reel adoption: TRIAL Df8qsq_iI-R (RepoMix: organize GitHub repos into AI-friendly format for coding agents) shipped, check passed.
- 2026-11-20 16:15 GMT TOKEN-CHECK: GitHub token active (source: keyring, length: 40 chars). Expiry check: classic PATs don't expire by default; fine-grained PATs have expiry set at creation. Recommend manual review of token settings at https://github.com/settings/tokens
- 2026-11-20 16:15 GMT TOKEN-CHECK: To enable 14-day and 3-day warnings, token creation date must be tracked. Create /home/andy/chapelgate/dell-watch/token-created.txt with ISO date of token creation.
- 2026-11-20 16:22 GMT STALE-CHECK: FAILING-FAST: tool-cost-tuning-r1-20261115 (unit tool-cost-tuning-r1)
- 2026-11-20 16:37 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-20 16:37 GMT STALE-CHECK: FAILING-FAST: reel-review-council-20261117-0916 (unit reel-review-council-20261117-0916)
- 2026-11-20 16:37 GMT STALE-CHECK: FAILING-FAST: release-truth-20261120 (unit job-release-truth)
- 2026-11-20 16:47 GMT reel adoption: TRIAL Df7c4CrDRdw (AI website builder creating 3D websites from single prompt) shipped, check passed.
- 2026-11-20 16:52 GMT STALE-CHECK: FAILING-FAST: fix-safety-screen-r1-20261115 (unit fix-safety-screen-r1)
- 2026-11-20 17:52 GMT STALE-CHECK: FAILING-FAST: fix-backup-failover-r1-20261115 (unit fix-backup-failover-r1)
- 2026-11-20 18:02 GMT reel adoption: ADOPT Df7PNxkRagB (MCP server vs agent business model (sell MCP plugins/APIs)) shipped, check passed.
- 2026-11-20 18:07 GMT STALE-CHECK: FAILING-FAST: ai-stage3-holiday-let-operator-20261115 (unit ai-stage3-holiday-let-operator)
- 2026-11-20 18:07 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-20 18:22 GMT STALE-CHECK: FAILING-FAST: video-skill-install-20261116 (unit video-skill-install-r1)
- 2026-11-20 18:37 GMT STALE-CHECK: IDLE no unit, not finished: ln-18-gate-tuning-20261119 (15h)
- 2026-11-20 18:37 GMT STALE-CHECK: IDLE no unit, not finished: ln-22-cooldown-stalls-20261119 (14h)
- 2026-11-20 19:07 GMT STALE-CHECK: FAILING-FAST: fix-safety-screen-r1-20261115 (unit fix-safety-screen-r1)
- 2026-11-20 19:07 GMT STALE-CHECK: FAILING-FAST: fix-safety-screen-r1-20261115 (unit fix-safety-screen-r1)
- 2026-11-20 19:22 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-20 19:22 GMT STALE-CHECK: FAILING-FAST: shadow-iso27001-20261116 (unit shadow-iso27001-r1)
- 2026-11-20 19:37 GMT STALE-CHECK: IDLE no unit, not finished: tender-owner-20261120 (6h)
- 2026-11-20 19:52 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ambient-context-local-work-diary-for-ai-20261118 (6h)
- 2026-11-20 19:52 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-audio8-speech-model-20261117 (6h)
- 2026-11-20 19:52 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-claude-code-front-end-design-toolkit-70-tools-th-20261117 (6h)
- 2026-11-20 19:52 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-claude-skills-short-files-standardizing-agent-be-20261118 (6h)
- 2026-11-20 19:52 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-comment-projects-and-i-ll-se-20261119 (6h)
- 2026-11-20 19:52 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-from-bulk-20261118 (6h)
- 2026-11-20 20:02 GMT reel adoption: TRIAL DfAmYQQDsNW (Fine-tune for behavior, knowledge in folder) shipped, check passed.
- 2026-11-20 20:02 GMT reel adoption STALLED: DfevuYyvCTB (Twill 8B coding model (8B params, 5GB)) past 2026-11-18 20:00, no update since 20 Nov 14:00, unit reel-trial-twil-8b-vs-qwen.
- 2026-11-20 20:02 GMT reel adoption: TRIAL DftTkQqnEMw (Vercel Agent Browser (QA with screenshots)) shipped, check passed.
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: ai-stage2-business-os-20261115 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: ai-stage2-holiday-let-operator-20261115 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: persona-round-holiday-let-operator-20261116 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: phone-stage2-maintenanceos-phone-line-20261115 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: phone-stage3-maintenanceos-phone-line-20261115 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: phone-stage4-maintenanceos-phone-line-20261115 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: phone-stage5-maintenanceos-phone-line-20261115 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-13-layers-of-production-stack-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-48-laws-of-powerful-agents-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-agent-failure-log-compliance-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-agent-kill-switch-runbook-drill-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-ai-coding-agent-dependency-supply-chain-risk-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-ai-receptionist-demo-claude-code-retell-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-ai-usage-cost-tracking-per-user-agent-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-anthropic-playbook-pattern-one-agent-playbook-pe-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-anti-sycophancy-prompt-for-ai-settings-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-bottleneck-theory-for-over-engineering-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-cloudflare-ai-security-audit-skill-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-cloudflare-ai-security-audit-skill-open-source-2-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-cloudflare-security-audit-estate-repos-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-cross-customer-data-separation-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-cybermes-autonomous-verified-security-agent-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-fable-5-2-progressive-disclosure-skills-insights-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-git-github-version-control-for-ai-coding-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-goldman-sachs-ai-governance-deloitte-accountabil-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-harness-ownership-principle-rules-permissions-ch-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-insurer-evidence-file-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-kru-ai-agent-key-vault-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-local-vs-global-problems-methodology-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-mass-assignment-vulnerability-is-admin-field-inj-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-microsoft-hackers-using-ai-to-scan-github-for-az-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-microsoft-outage-health-check-cascade-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-musk-5-step-building-algorithm-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-mythos-5-2-ai-security-testing-finds-12-vuln-cla-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-oauth-grant-inventory-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-oauth-redirect-uri-validation-google-oauth-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-ocr-it-local-pdf-ocr-browser-extension-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-outcome-first-prompting-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-password-reset-poisoning-fix-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-sandbox-lockdown-dell-agent-units-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-secure-ai-apps-data-server-server-side-auth-secr-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-sellable-commercial-readiness-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-shadow-ai-usage-64-on-personal-accounts-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-six-essential-documents-before-vibe-coding-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-six-pillars-for-claude-code-business-repo-struct-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-six-ui-ux-principles-for-product-design-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-tech-debt-skill-ai-code-audit-github-ksimback-te-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-three-question-release-gate-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-vibe-coding-supabase-open-access-rules-data-expo-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-vllm-uc-berkeley-open-source-inference-server-pa-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-adopt-voice-cloning-tool-3-sec-audio-no-login-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-47-ai-agents-running-a-company-shared-brain-mode-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-agentcraft-ai-agents-in-minecraft-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-automation-seo-social-media-content-engine-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-content-system-for-product-visibility-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-found-a-php-hole-in-70-of-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-invoice-clerk-copilot-studio-bank-change-frau-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-native-v2-operating-system-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-profit-boardroom-claude-obsidian-seo-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-profit-boardroom-claude-whiteboards-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-profit-boardroom-claudecodeagenticos-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-anthropic-fable-5-2-launch-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-api-key-encryption-kms-pattern-plain-text-keys-i-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-bama-mac-app-rebuild-with-claude-code-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-black-mirror-method-self-cloning-with-claude-cod-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-black-october-isn-t-over-part-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-bookshelf-self-hosted-e-book-library-no-db-cloud-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-browser-automation-opencli-turn-website-interact-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-build-an-ai-trading-team-with-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-build-first-ai-agent-in-claude-code-step-by-step-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-calibri-744b-model-on-cpu-disk-streaming-openai-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-claude-diagram-design-skill-58k-stars-flowcharts-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-claude-mods-prompt-rewriting-agent-chat-linking-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-claude-opus-5-5-agent-os-with-shared-memory-acro-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-claude-paper-skill-local-ocr-on-device-free-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-claude-red-free-open-source-security-playbooks-f-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-claude-security-anti-patterns-api-key-front-end-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-cli-anything-claude-integration-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-cloudflare-ai-security-agents-creating-false-pos-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-cloudflare-security-audit-skill-for-claude-code-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-cloudflare-security-skill-auto-audits-systems-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-codejury-two-model-jury-ai-code-review-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-comment-need-if-you-want-the-l-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-fable-5-2-free-trial-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-fable-reset-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-five-mcp-connectors-for-claude-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-four-claude-seo-tools-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-fusion-embedding-multimodal-model-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-gal-central-ai-agent-config-manager-17-agents-ya-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-gemini-4-carbon-on-google-cloud-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-gemini-decision-1-fast-decision-model-yes-no-mul-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-gemini-notebook-flashcard-upgrades-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-google-ai-studio-update-gemini-omni-1-2-flash-fo-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-google-antigravity-2-32-0-swarm-dynamic-workflow-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-google-antigravity-browser-agent-browse-build-te-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-google-antigravity-voice-mode-remote-agents-slas-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-google-street-view-blur-technique-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hallmark-design-skill-together-ai-50-themes-755-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-heimdall-local-persistent-ai-agent-brain-zero-to-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-agent-6-levels-hearth-release-1650-change-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-agentos-dashboard-demo-oracle-video-agent-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-multi-agent-ai-workspace-with-group-chats-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-obsidian-agentos-ai-assistant-with-person-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-obsidian-shared-memory-for-ai-agents-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hyperframes-code-to-video-via-claude-code-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-jane-street-socratic-tutor-free-claude-skill-ada-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-kern-rootless-sandbox-3ms-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-latticedb-local-graph-semantic-text-db-zig-singl-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-lp-skill-design-principles-nielsen-gestalt-fitts-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-mailflare-self-hosted-google-workspace-alt-with-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-matt-pocock-skills-for-real-engineers-claude-cod-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-mesh-llm-distributed-llm-inference-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-meta-asterix-design-system-150-components-mcp-se-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-meta-n-the-ai-that-codes-its-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-minimax-h3-director-cut-studio-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-notion-ai-second-brain-template-for-agents-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-numbat-model-malware-warning-oathbreaker-advocac-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ocr-it-local-pdf-ocr-browser-extension-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-omega-agent-orchestration-opus-plans-haiku-execu-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-open-source-voice-cloning-local-cpu-7-sec-clone-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-openai-businesses-in-chatgpt-business-hub-busine-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-openai-dots-always-on-ai-agents-with-own-compute-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-openinbox-free-email-tool-on-cloudflare-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-physical-ai-with-raspberry-pi-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-pibench-ai-coding-agent-benchmark-real-bugs-sand-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-seo-backlinks-with-fable-5-2-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-shared-ai-agent-memory-hermes-obsidian-20261118 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-skillopt-sleep-cycle-for-claude-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-slashbrag-launch-video-skill-for-coding-agents-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-terminal-phone-iphone-in-terminal-ai-agent-contr-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-top-10-mcp-servers-ranking-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-top-5-mcps-for-claude-perplexity-playwright-farc-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-tradingagents-multi-agent-adversarial-pattern-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-twil-8b-vs-qwen-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-uh-oh-here-we-go-again-every-20261119 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-vercel-agent-browser-shakedown-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-voice-agent-approval-workflow-claudecode-fish-au-20261117 (6h)
- 2026-11-20 20:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-you-already-have-an-ai-that-st-20261119 (6h)
- 2026-11-20 20:17 GMT reel adoption: TRIAL Df4v9ezg2ZC (SAPA AI hackers / Cellbird AI sales) shipped, check passed.
- 2026-11-20 20:17 GMT reel adoption: TRIAL Dfc8dbwBp2K (YC GTM strategy via Claude) shipped, check passed.
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: ln-16-model-preflight-live-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-agent-os-step-5-preview-multi-agent-ai-wo-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-hermes-agentos-complete-guide-mixture-of-agents-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-how-long-till-claude-books-me-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-how-to-improve-a-private-secur-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-i-sat-by-the-river-bank-i-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-learn-ai-automation-from-scratch-in-three-months-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-llm-wiki-skill-organizer-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-nine-free-github-repos-as-paid-tool-alternatives-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-private-rag-on-mac-with-ollama-anythingllm-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-process-before-ai-framework-stopwatch-method-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-rag-pdf-question-answering-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-redcell-ai-pentesting-agent-recon-cve-prompt-inj-20261118 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-run-an-open-source-ai-agent-on-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-skilltreeos-ai-agent-map-7-depts-34-teams-137-jo-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-tech-debt-skill-ai-code-audit-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-thermonuclear-code-quality-review-cursor-skill-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-these-security-issues-are-gett-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-this-tiny-robot-duck-costs-und-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-three-claude-settings-for-business-plugins-conne-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-untangle-codebase-skill-for-claude-code-cleanup-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-urbanground-testing-ai-in-rea-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-vercel-agent-browser-ai-agent-testing-20261117 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-video-editing-skills-ranking-security-warnings-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-xrepotest-ai-code-testing-20261119 (6h)
- 2026-11-20 20:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-youtube-agent-skill-free-ai-content-team-20261119 (6h)
- 2026-11-20 20:32 GMT reel adoption: TRIAL DfivXS1hpEr (Coca-Cola context compression (70-89% tokens)) shipped, check passed.
- 2026-11-20 20:32 GMT reel adoption: TRIAL DfOnojTRLbF (AI browser bypassing Cloudflare) shipped, check passed.
- 2026-11-20 20:37 GMT STALE-CHECK: IDLE no unit, not finished: persona-round-public-sector-citizen-agent-20261116 (6h)
- 2026-11-20 20:37 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-jarvis-agent-os-running-100-locally-on-mac-20261119 (6h)
- 2026-11-20 20:37 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-reverse-engineer-how-any-app-f-20261119 (6h)
- 2026-11-20 20:47 GMT reel adoption: TRIAL Dfpjnx4gybG (10 vibe-coder compliance mistakes) shipped, check passed.
- 2026-11-20 20:47 GMT reel adoption: TRIAL DfuiklzvJf5 (Meta Asterix design system (MCP)) shipped, check passed.
- 2026-11-20 20:52 GMT STALE-CHECK: llama-server 8081 DOWN
- 2026-11-20 20:52 GMT STALE-CHECK: FAILING-FAST: hcv-release-push-20261120 (unit job-hcv-release-push)
- 2026-11-20 20:52 GMT STALE-CHECK: IDLE no unit, not finished: ef-ops-hardening-20261119 (6h)
- 2026-11-20 20:52 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-general-motors-announced-some-20261119 (6h)
- 2026-11-20 21:02 GMT reel adoption: TRIAL DftiFbNxZbp (64 agents / 261 skills Cloud Code repo) shipped, check passed.
- 2026-11-20 21:02 GMT reel adoption: TRIAL DfvdjKIRHuG (Claude Code tips (status, skill, MD)) shipped, check passed.
- 2026-11-20 21:02 GMT reel adoption: TRIAL DfxGmWZPfZt (OpenMouseBot autonomous bots) shipped, check passed.
- 2026-11-20 21:07 GMT STALE-CHECK: IDLE no unit, not finished: estate-automation-audit-20261119 (6h)
- 2026-11-20 21:07 GMT STALE-CHECK: IDLE no unit, not finished: ln-05-mistral-403-20261119 (6h)
- 2026-11-20 21:07 GMT STALE-CHECK: IDLE no unit, not finished: ln-14-taskdir-tests-20261119 (6h)
- 2026-11-20 21:07 GMT STALE-CHECK: IDLE no unit, not finished: ln-21-nvidia-429-schedule-20261119 (6h)
- 2026-11-20 21:07 GMT STALE-CHECK: IDLE no unit, not finished: persona-round-information-rights-complaints-20261116 (6h)
- 2026-11-20 21:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-comment-community-to-build-all-20261119 (6h)
- 2026-11-20 21:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-crawlie-free-open-source-seo-crawler-in-rust-20261119 (6h)
- 2026-11-20 21:07 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-forecast-price-with-kronos-a-20261119 (6h)
- 2026-11-20 21:17 GMT reel adoption: TRIAL DfqWmHCmU9p (Fable 5.2 AI design assistant) shipped, check passed.
- 2026-11-20 21:22 GMT STALE-CHECK: IDLE no unit, not finished: ef-model-lane-20261119 (6h)
- 2026-11-20 21:22 GMT STALE-CHECK: IDLE no unit, not finished: ln-08-staging-router-20261119 (6h)
- 2026-11-20 21:22 GMT STALE-CHECK: IDLE no unit, not finished: ln-10-omniroute-council-20261119 (6h)
- 2026-11-20 21:22 GMT STALE-CHECK: IDLE no unit, not finished: ln-25-overnight-resilience-20261119 (6h)
- 2026-11-20 21:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-review-council-20261120-0946 (6h)
- 2026-11-20 21:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-ai-video-production-course-7-step-line-20261119 (6h)
- 2026-11-20 22:22 GMT STALE-CHECK: IDLE no unit, not finished: ef-alerts-notify-20261119 (6h)
- 2026-11-20 22:22 GMT STALE-CHECK: IDLE no unit, not finished: ln-04-combo-429-20261119 (6h)
- 2026-11-20 22:22 GMT STALE-CHECK: IDLE no unit, not finished: ln-07-reroute-free-only-20261119 (6h)
- 2026-11-20 22:22 GMT STALE-CHECK: IDLE no unit, not finished: ln-11-container-reach-20261119 (6h)
- 2026-11-20 22:22 GMT STALE-CHECK: IDLE no unit, not finished: reel-trial-repomix-organize-github-repos-into-ai-friendly-f-20261120 (6h)
- 2026-11-20 22:22 GMT STALE-CHECK: IDLE no unit, not finished: rokoko-smartgloves-ii-20261120 (6h)
### TAILSCALE KEY EXPIRY CHECK 2026-11-20 22:32:08 GMT
- OK SELF dell-t5820: tailscale key expires 2027-05-10T09:02:10Z (170 days left)
- OK PEER Andrew’s Mac Studio (macOS) online=True active=True: tailscale key expires 2027-05-07T16:42:09Z (167 days left)
- OK PEER localhost (iOS) online=True active=False: tailscale key expires 2027-04-20T21:04:51Z (150 days left)
- OK PEER CG (windows) online=True active=False: tailscale key expires 2027-04-20T21:03:52Z (150 days left)
- OK PEER cg-jobs (linux) online=False active=False: tailscale key expires 2027-04-20T22:25:56Z (150 days left)

- 2026-11-20 22:32:30 GMT | CRITICAL | build-complete | Test alert delivered via ALERTS.md fallback route (dell-t5820.taild4745e.ts.net). No email sender, no SMS - Mac lane needs browser re-auth, so fallback is used per BRIEF 35/36. | route: dell-watch/ALERTS.md | https://dell-t5820.taild4745e.ts.net
- 2026-11-20 22:37 GMT STALE-CHECK: IDLE no unit, not finished: energy-reasoners-two-council-20261120 (6h)
- 2026-11-20 23:07 GMT STALE-CHECK: llama-server 8081 DOWN
