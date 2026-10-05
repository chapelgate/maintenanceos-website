# MaintenanceOS — Commercial Release Master Problems

Created: 2026-10-05

Live execution state is held in the Chapelgate AI Control Room project `MaintenanceOS Commercial Release`. The stable task map is `docs/commercial_release/MASTER_RELEASE_REGISTER.md`.

| Problem | Severity | State | Owning task |
|---|---|---|---|
| LUMI candidate not yet frozen | Critical | Existing evaluation still running | CR-H01 |
| Existing live-host deployment authority unavailable | Critical | Human/admin gate | existing MOS blocker / #18 |
| Product-name clearance not completed | Critical | Research available; professional decision later | CR-01 / CR-H02 |
| Production retention/deletion/legal-hold workflow incomplete | Critical | Work available | CR-03 / CR-06 / CR-11 / CR-13 |
| Production user identity/MFA/RBAC/session controls incomplete | Critical | Work available | CR-05 / CR-12 / CR-13 |
| Social-housing statutory timing controls not yet explicitly proven | Critical for that market | Work available | CR-04 / CR-10 / CR-13 |
| DPIA/data-flow/legal treatment not professionally signed off | Critical | Fact work available | CR-03 / CR-H03 |
| Provider commercial/data-processing permissions not consolidated | Critical | Work available | CR-02 |
| Independent security acceptance not yet completed on integrated candidate | Critical | Held until candidate ready | CR-15 / CR-H04 |
| Website legal-source closure incomplete | High | Work available | CR-08 |
| Production observability/incident evidence incomplete | High | Work available | CR-09 |
| Frozen-candidate supply-chain/licence evidence incomplete | High | Work available | CR-07 |
| Customer trust pack incomplete | High | Held on evidence inputs | CR-14 / CR-H03 |
| UK design-partner pilot not yet completed | Critical before GA | Held | CR-16 |
| Final evidence audit/launch decision not completed | Critical before GA | Held | CR-17 / CR-H05 |

## Duplication removed

- Control Room #681 is superseded by #676 plus the commercial-release register.
- Control Room #687 is superseded by #685 plus the commercial-release register.
- Existing SCA/SBOM tooling is reused; no second scanner/SBOM pipeline is authorised.
- Existing Control Room allocator is reused; no second queue/dispatcher is authorised.


## 2026-10-05 — Worker-lane execution problems and resolutions

- **Local model long-input instability — RESOLVED AS OPERATING CONSTRAINT.** Existing Granite 4 Tiny models were recovered from `C:\Users\Andy\colibri\ollama-models`. A small inference passed. A combined long source prompt reset the isolated Ollama connection, while source-bounded chunks passed. Rule: local lane is one-shot, one small model at a time, `keep_alive=0`, bounded context, supplied evidence only. Weak/nonresponsive output is rejected. CR-03L completed with accepted source-bounded extracts at commit `a0b2b7c98556d35083bd66ab4eed52dcef696236`.
- **NVIDIA persistent-owner auth drift — OPEN, NON-BLOCKING TO OTHER LANES.** Existing long-running owner-service OpenCode state returned 401 on an earlier live-state probe. Repository secret hygiene run `37373177203` passed and fresh bounded NVIDIA connectivity run `37373676926` returned HTTP 200 from `openai/gpt-oss-20b`, proving provider/account access is healthy. Do not copy stale owner authentication into new work. Use only a project-scoped approved attachment before CR-11 is claimed.
- **Antigravity execution credential/path not currently wired — OPEN, HELD.** Direct Antigravity worker code and offline acceptance are proven, but the current NVDL/MaintenanceOS/cloud repository secret inventories do not expose its required Gemini/Google execution credential and the connected Windows environment has no such environment variable. Old example/reference files are not accepted as credentials. CR-10/CR-12 remain dependency-held and must not be marked in progress until the existing authorised Antigravity execution route is located or restored.
- **Claude exclusion — OWNER CONSTRAINT, NOT A BLOCKER.** Claude/Claude Code/fallback/reviewer routes are excluded from this release programme by owner instruction. All allocations must fail closed rather than fall back to Claude.
