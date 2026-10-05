# CR-02 — Provider Rights and Data-Processing Register

**Status:** FACTUAL REGISTER COMPLETE — runtime/account verification remains a release gate  
**Date:** 2026-10-05  
**Scope:** providers materially referenced by canonical MaintenanceOS source and the existing LUMI programme. This document records published terms and source facts; it is not legal advice and does not accept terms, change accounts, or approve a provider.

## Canonical provider use proved from MaintenanceOS source

- `provider_runtime.py`: realtime voice allowlist is `gemini` and `openai`.
- `README.md`: Gemini Live is the primary configured realtime receptionist; OpenAI Realtime remains fallback/legacy.
- `provider_webhooks.py` / product documentation: Twilio is the phone-carrier boundary.
- `email_gateway.py`: Resend HTTPS is the preferred live email provider when configured; SMTP is a bounded fallback path.
- Production/test hosting uses DigitalOcean in the current estate.
- `hpc/lumi/README.md`: LUMI is MaintenanceOS R&D/evaluation only, synthetic data only, with no live resident/customer data.

## Provider register

| Provider | Current MaintenanceOS purpose | Published commercial/data position | Retention / transfer facts relevant to release | Release evidence required |
|---|---|---|---|---|
| **Google Gemini API / Gemini Live** | Primary realtime voice AI | Gemini API Additional Terms effective 23 Mar 2026 say use is for professional/business purposes. API Clients made available to users in the UK/EEA/Switzerland may use **only Paid Services**. Gemini API is a Paid Service only when accessed through a Cloud Project with an active billing account. For Paid Services, Google says prompts/responses are not used to improve its products and are processed under Google's processor DPA. | Paid Services still involve limited safety/abuse logging. Google's ZDR guidance says stateful features can create additional storage: Live API session-resumption state may persist up to 24h; File API persists until deletion/expiry; Interactions defaults to state storage unless `store=false`; caching/grounding have feature-specific retention. | Prove the exact production Cloud Project has active billing; record account/project owner, model and API route; record whether Session Resumption, Files, Interactions, caching or Grounding are enabled; record applicable Google DPA and data-region/ZDR setting. Do not put resident data through an unverified unpaid/non-billing-backed route. |
| **OpenAI API / Realtime** | Optional fallback/legacy realtime voice | OpenAI's current business/API material says API inputs/outputs are not used for model training by default unless the customer explicitly opts in. OpenAI's DPA effective 1 Jan 2026 describes OpenAI as processor for Customer Data under covered business services. | Current API data-control docs say standard abuse-monitoring logs may be retained up to 30 days. Endpoint-specific application-state rules apply. Current docs list `/v1/realtime` as no application-state retention under the normal endpoint table, while ZDR/MAM are separately configurable for eligible organisations/projects. OpenAI publishes a current subprocessor list. | Prove the exact OpenAI organisation/project used by MaintenanceOS; record whether data sharing is disabled; record current retention control (default/MAM/ZDR/etc); record endpoint/model and regional-processing configuration; retain current DPA/subprocessor list. No assumption that an account is ZDR merely because the endpoint supports it. |
| **Twilio** | PSTN number, inbound HTTP/WSS media, call metadata, transfers | Twilio DPA updated 9 Apr 2026 states Twilio can act as processor/subprocessor for Customer Personal Data and also identifies limited controller processing. It covers UK GDPR/DPA/PECR and incorporates international-transfer provisions. | Twilio maintains a current subprocessor list (updated Sep 2026) and DPA includes UK transfer mechanism language. Communications content/usage/account data categories require service/config-specific review. | Record the exact Twilio account/subaccount, number(s), enabled recording/transcription features, data-region/edge settings if used, retention configuration, subprocessor list and DPA. Explicitly prove whether raw calls are recorded; do not infer recording from transcript persistence. |
| **DigitalOcean** | Application/VM/static hosting and potentially managed data services | DigitalOcean DPA last updated 6 Feb 2026 applies where it processes personal data for customers and includes UK transfer provisions. Current TOS incorporates the DPA. | DPA states processor data is retained for the Agreement duration and includes SCC/UK Addendum mechanisms plus a published subprocessor framework. Product-level backup/snapshot/managed-database settings still determine actual storage/retention. | Inventory every MOS DigitalOcean resource actually in scope; record region, service type, backups/snapshots/PITR/logs, encryption and deletion settings; retain DPA/subprocessor version. Do not treat the marketing static site and product/voice hosts as the same data-processing surface. |
| **Resend** | Outbound operator/customer email | Resend states an Article 28 DPA is in force for every account and is executable on signup. For Customer Data it acts as processor; account/billing/usage data is treated separately. | Resend says customer data is stored in the **United States**, including message content, delivery logs, webhook payloads and account records. UK transfers use the UK Addendum; EU SCCs/DPF mechanisms are described. Free/Pro/Scale email/log data retention is stated as 30 days; remaining customer data deleted within 90 days after termination; backups persist 7 days. Current subprocessor list updated 27 Aug 2026. | Record the exact Chapelgate Resend account/domain, plan, sender, retention tier, DPA and subprocessor version; make the US transfer explicit in the DPIA/subprocessor schedule. Confirm only the data actually needed is included in call-summary emails. |
| **LUMI / EuroHPC AI Factory** | Synthetic MaintenanceOS R&D/evaluation, not production | EuroHPC AI Factories Industrial Innovation access is intended for industry/SMEs/startups; Fast Lane is for medium allocations up to 50,000 GPU hours. Current Terms of Reference include industrial/commercial companies/SMEs/startups among eligible applicants subject to call conditions. | The canonical MOS LUMI scaffold independently imposes **synthetic-data-only**, MaintenanceOS-only, no live resident/customer personal data, retain allocation restrictions and technical-assessment evidence. LUMI is not a production processor path in this release design. | Preserve award/call Terms of Reference, Technical Assessment/restrictions, project/account ID, allocation dates, job/usage evidence and synthetic corpus hash. Never upload real resident/customer data unless a separately approved legal/security change explicitly replaces the current guardrail. |
| **Open-source Python dependencies** | Application/runtime/test libraries | Rights are package-specific. CR-07 owns the exact licence inventory and prevents duplication here. | Repository currently has no root licence evidence that by itself resolves all third-party obligations. | Use CR-07 frozen-candidate SBOM/licence register; counsel/owner closes any attribution/notice/copyright questions before commercial distribution. |

## Authoritative/public sources retained for this register

### Google Gemini
- Gemini API Additional Terms, effective 23 Mar 2026: https://ai.google.dev/gemini-api/terms
- Gemini API Zero Data Retention guidance: https://ai.google.dev/gemini-api/docs/zdr

Key release facts verified from the terms:
- UK-facing API Clients may use only Paid Services.
- Gemini API counts as Paid only through a Cloud Project with active billing.
- Paid prompts/responses are not used to improve Google products.
- feature choices change storage/retention behaviour.

### OpenAI
- OpenAI DPA, effective 1 Jan 2026: https://openai.com/policies/data-processing-addendum/
- Business data privacy: https://openai.com/business-data/
- API data controls: https://developers.openai.com/api/docs/guides/your-data
- Subprocessors: https://openai.com/policies/sub-processor-list/

### Twilio
- DPA, updated 9 Apr 2026: https://www.twilio.com/en-us/legal/data-protection-addendum
- Subprocessors, updated Sep 2026: https://www.twilio.com/en-us/legal/sub-processors

### DigitalOcean
- DPA, updated 6 Feb 2026: https://www.digitalocean.com/legal/data-processing-agreement
- Current TOS: https://www.digitalocean.com/legal/terms-of-service-agreement

### Resend
- GDPR/DPA information: https://resend.com/security/gdpr
- Subprocessors, updated 27 Aug 2026: https://resend.com/legal/subprocessors

### EuroHPC / LUMI
- AI Factories access modes: https://www.eurohpc-ju.europa.eu/ai-factories/ai-factories-access-modes_en
- Fast Lane: https://www.eurohpc-ju.europa.eu/ai-factories/ai-factories-access-modes/fast-lane-access-ai-factories_en
- Industrial Innovation Terms of Reference (V3, 31 Mar 2026): linked from the EuroHPC AI Factories access pages.
- Canonical local guardrails: `docs/eurohpc/LUMI_IMPLEMENTATION_STATUS.md` and `hpc/lumi/README.md`.

## Cross-provider release checks

Before general commercial release, the release evidence matrix must show for every active provider:

1. **Contract/account authority** — contracting Chapelgate entity and authorised account owner are known.
2. **Commercial tier/right** — the exact runtime is permitted for the UK commercial use; no free/research/non-commercial assumption.
3. **Data role** — processor/subprocessor/controller role is captured where relevant.
4. **DPA/terms version** — current applicable DPA and service terms retained.
5. **Data categories** — exact fields/content crossing the boundary are mapped from CR-03, not guessed.
6. **Location/transfers** — storage/processing regions and transfer mechanism recorded.
7. **Retention** — default and configured retention for the exact product/features recorded.
8. **Training/improvement** — provider content-use setting/term captured and opt-in sharing disabled unless separately approved.
9. **Subprocessors** — current list/version retained and customer disclosure updated.
10. **Deletion/exit** — deletion/export/termination path documented and tested where technically available.
11. **Incident contact** — breach/security notification route and account contact recorded.
12. **Configuration proof** — screenshots/API evidence/boolean-safe runtime evidence proves the account is configured as the register says; terms alone are not configuration proof.

## Gate result

**CR-02 PASS as a factual provider-rights/data-processing research slice.**

This does **not** mean provider accounts are release-approved. The configuration/account verification items above feed CR-14 and the DPIA/legal-counsel gate. Any provider actually disabled in the frozen candidate may be removed from the active subprocessor/runtime schedule rather than being configured unnecessarily.
