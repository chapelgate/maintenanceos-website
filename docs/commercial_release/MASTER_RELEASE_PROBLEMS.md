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


## 2026-10-06 — Commercial release council/legal reconciliation

Full evidence-backed review: `docs/commercial_release/COMMERCIAL_RELEASE_COUNCIL_REVIEW_20261006.md`.

New/reconciled release problems:
- **Global-compliance scope is undefined — CRITICAL before non-UK sales.** Release must use a default-deny jurisdiction whitelist. UK is the first intended market; EU/EEA and every further market require their own privacy/AI/telecoms/contract/accessibility/data-transfer review before onboarding.
- **UK product legal pack is not counsel-approved — CRITICAL.** Contracting entity, controller/processor roles, lawful-basis map, DPIA, product privacy/call notice, DPA, subprocessor/transfer schedule, retention schedule, B2B terms/SLA and statutory website disclosures remain release gates.
- **AI/call transparency must match frozen runtime — CRITICAL.** The caller must be told they are interacting with AI; any statement about recording versus transcription must reflect actual configuration. EU/EEA expansion must satisfy AI Act Article 50 transparency from the first interaction.
- **ICO fee/registration status for the final controller is not yet evidenced — HIGH.** Confirm using the ICO self-assessment and retain evidence for the contracting controller.
- **International transfer/configuration proof remains incomplete — CRITICAL.** Provider research exists, but exact production DPAs, subprocessors, regions, retention, data-use/training settings and UK transfer mechanisms/data-protection tests must be proved for the frozen provider set.
- **Accessibility/reasonable-adjustment acceptance is incomplete — HIGH.** Add disabled-user voice/web/dashboard scenarios and retain evidence; public-sector customer deployments may also require WCAG 2.2 AA/accessibility-statement conformance.
- **SOC 2 is not a statutory launch gate — CLARIFIED.** Treat it as later customer assurance, not a substitute for legal/security duties. Prefer Cyber Essentials as the near-term UK assurance milestone once release-critical controls are actually operating.
- **Awaab Phase 2 readiness is time-critical — CRITICAL for England social-housing market.** Phase 2 begins 30 November 2026; release tests must cover the expanded significant-hazard scope before that date if the product is offered in that market.

The existing technical blockers remain authoritative: LUMI exact candidate freeze, approved deployment identity, real managed IdP/MFA/RBAC/session proof, data lifecycle operations, managed PostgreSQL recovery drill, central/tamper-resistant observability, independent penetration test, UK design-partner pilot, final evidence audit and owner approval.
