# Trial RESULT: reel DfphR2sCjVT (OpenAI Businesses in ChatGPT - Business Hub, Business Agents, Business Insights)

## Trial Period: 2026-11-18

## Objectives (from REEL-DECISIONS.md and BRIEF.md):
Run a sandboxed trial of OpenAI Businesses in ChatGPT (Business Hub, Business Agents, Business Insights) for Business Evidence Wallet, Legal Case Management, Citizen Agent. Smallest real change, own repos only, PRs through merge council until merged; trials report-only in a sandbox with a written ADOPT/WATCH/DROP result.

## Reel Overview
- **Reel ID**: DfphR2sCjVT (council 17 Nov 2026)
- **Source**: aiprofitboardroom_ (Instagram)
- **OpenAI Launch**: November 10, 2026 (beta)
- **ChatGPT Weekly Users**: 1.2 billion
- **Three Components**:
  1. **Business Hub**: Claim business inside ChatGPT, verify via phone/email/DNS/Shopify, Persona identity check, blue verified badge
  2. **Business Agents**: AI agent that talks to customers; give business info + write instructions; test with real questions; publish; labeled as agent; cannot finish purchases, make bookings, look up orders
  3. **Business Insights**: 28-day view of mentions, clicks, topics; privacy: no individual chat logs, grouped analytics only
- **Availability**: U.S. e-commerce/online services only currently
- **Sponsored Agents** (Sep 16, 2026): Ads with AI chats; not hooked to Business Hub agent yet

## Estate Product Evaluation

### 1. Business Evidence Wallet
**Fit**: High - Business agent for customer-facing document/information requests

**Analysis**:
- BEW handles document ingestion, verification, and evidence management
- Business Agent could serve as customer-facing interface for:
  - Document type inquiries
  - Process status checks
  - Submission guidance
  - Policy questions (returns, delivery, etc.)
- Business Hub verified profile could enhance BEW credibility

**Constraints**:
- Requires ChatGPT Business/eligible account (cannot create per estate rules)
- U.S.-only availability limits global estate deployment
- Agent cannot complete transactions (only guides to website)

### 2. Legal Case Management
**Fit**: High - Agent for client intake, FAQ, document guidance

**Analysis**:
- Legal Case Management could use Business Agent for:
  - Initial client screening/questions
  - Document checklist guidance
  - Process explanations
  - Appointment routing (agent sends to booking page)
- Persona verification adds trust layer

**Constraints**:
- U.S. e-commerce/online services only - legal services may not qualify
- Cannot access case-specific data or look up orders/clients
- Requires OpenAI account and Business Hub setup

### 3. Citizen Agent
**Fit**: High - Government service agent pattern

**Analysis**:
- Citizen Agent handles public sector inquiries
- Business Agent pattern could apply to:
  - Service information and eligibility
  - Document requirements
  - Process guidance
  - Multi-language support (if agent supports)
- Government trust signals via verified badge

**Constraints**:
- U.S.-only availability conflicts with UK public sector focus
- Government services may not qualify as "e-commerce/online services"
- Cannot complete transactions or access citizen records
- Persona identity check may not work for government entities

## Security Evaluation

### Positive Security Features:
- **Privacy by design**: "Businesses don't see what each person typed, and they don't get the chat logs from the agent. It's all grouped together."
- **Agent limitations**: "Cannot finish a purchase, make bookings, look up someone's order" - limited scope reduces risk
- **Labeled as agent**: Clear disclosure to users they're talking to AI
- **Instruction pro tips**: Only use real business info; never make up stock/deals/dates; say when doesn't know; send to support page; never push/ask for unneeded personal info

### Security Risks:
- **Instruction injection risk**: If agent instructions not carefully crafted, could be manipulated
- **Third-party identity verification**: Persona check involves third-party service
- **Data residency**: ChatGPT data processed on OpenAI infrastructure (U.S.)
- **No network egress verification**: Cannot verify without live account
- **Sponsored Agents separate**: Business Hub agent and Ads Manager agent don't share settings - dual setup risk

## Technical Constraints for Estate

### Hard Rule Blockers:
1. **No sign-ups/accounts**: Cannot create ChatGPT Business account or OpenAI API account for testing
2. **No spend**: Cannot pay for Business plan or API usage
3. **U.S.-only availability**: Estate operates globally (UK-focused); current geographic restriction
4. **No external service data**: Cannot send estate code/data to OpenAI for testing

### What Can Be Evaluated Without Account:
- Documentation review (OpenAI help docs, API reference)
- Architecture pattern analysis
- Security model assessment
- Integration pattern design (theoretical)
- Cost estimation based on public pricing

## Trial Methodology

Since we cannot create accounts or spend money (hard rules), this trial is **documentation-based analysis only**:

1. **Reviewed**: REEL-DECISIONS.md row 334, /mnt/d/reel-bulk/reviews/andy-video-instagram-DfphR2sCjVT-REVIEW.md, TRANSCRIPT.md, SUMMARY.md
2. **Analyzed**: OpenAI Business Hub, Business Agents, Business Insights documentation patterns
3. **Evaluated**: Fit for three estate products against estate rules and constraints
4. **No live testing**: Cannot access ChatGPT Business Hub, create agents, or test Business Insights

## Recommendation: WATCH

### Rationale:
1. **High conceptual fit** for all three products (BEW, Legal Case Management, Citizen Agent)
2. **Strong privacy and safety design** by OpenAI (grouped analytics, agent limitations, clear labeling)
3. **Blocked by hard rules**: Cannot create accounts, cannot spend, U.S.-only availability
4. **Requires OpenAI partnership/access** for meaningful evaluation
5. **Re-evaluate when**: 
   - Geographic availability expands beyond U.S.
   - Estate can evaluate via partner access or sandbox
   - Alternative self-hosted agent patterns mature (Hermes, Omega, etc. already in trial)

### Dissent Consideration:
- **Product seat**: Could be ADOPT for pattern reference only (agent instruction patterns, privacy design)
- **Estate/Ops seat**: WATCH - no actionable path without OpenAI account
- **Security seat**: WATCH - strong privacy model but cannot verify without live testing

**Majority: WATCH** - High potential, blocked by access constraints

## Next Steps (if WATCH lifted):
1. Monitor OpenAI geographic expansion announcements
2. Evaluate alternative agent frameworks already in trial (Hermes+Obsidian, Omega Orchestration, Google Antigravity)
3. Consider self-hosted agent patterns for estate products
4. Document agent instruction best practices from OpenAI pro tips for internal use
5. Re-trial when U.S.-only restriction lifts or partner access available

## Evidence
- REEL-DECISIONS.md line 334
- /mnt/d/reel-bulk/reviews/andy-video-instagram-DfphR2sCjVT-REVIEW.md
- /mnt/d/reel-bulk/outbox/andy-video-instagram-DfphR2sCjVT/TRANSCRIPT.md
- /mnt/d/reel-bulk/outbox/andy-video-instagram-DfphR2sCjVT/META.json
- OpenAI Business Hub documentation (public)
- Council verdict: TRIAL (3-0) per REVIEW.md

## Council Verdict for This Trial: WATCH

This trial report is complete. No code changes, no PRs, no account creation. Pure documentation-based evaluation per estate hard rules.
