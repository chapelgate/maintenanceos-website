# Agent Factory Problem Log

Persistent engineering problem record for the website Agent Factory. Append evidence; do not erase failed paths.

## 2026-09-27 — Step 5: generic pack builder ignored selected role

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** after Step 4, selecting Maintenance desk, Booking assistant, Customer service, Sales/enquiry or Custom still entered the legacy generic `buildReceptionistDraft` prompt path, whose role text was hard-coded as a ReceptionistOS sandbox receptionist.
- **Root cause:** Step 4 created a bounded AgentBlueprint, but the Pack step still generated its system prompt solely from the legacy reviewed-draft helper and did not consume AgentBlueprint controls.
- **Smallest fix:** add one adapter (`src/lib/agent-configuration.ts`) that reuses the existing knowledge-pack normalizer while deriving behaviour, permissions, escalation and forbidden actions only from the validated AgentBlueprint.
- **Security invariant:** website/reviewed text is emitted only as untrusted data. It cannot alter agent type, capabilities, escalation rules, forbidden actions, privacy or integrations.
- **Regression coverage added:** all six roles; malicious website prompt injection; malicious editable prompt text; trusted-tail deduplication; prompt-length pressure; no invented FAQ questions.
- **Live phone impact:** none. No MaintenanceOS telephony/runtime file is modified by this step.

## 2026-09-27 — Step 5 verification runner unavailable

- **State:** OPEN BLOCKER FOR FREEZE ONLY.
- Both authorised Desktop Commander devices are offline. GitHub repo has no existing workflow runner and this task will not add duplicate/paid CI solely for verification.
- Code remains isolated on `agent-factory/step5-generate-agent-configuration`.
- Step 5 must not merge or be described as frozen until focused tests, full tests, changed-file lint and production build pass on an execution runner.

## 2026-09-27 — Step 5: trusted-marker collision could truncate later website data

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** if untrusted website/review text contained the literal trusted-control marker, initial prompt generation could treat that occurrence as a prior trusted tail and discard later untrusted data.
- **Security effect:** no privilege escalation; trusted controls were still appended. The defect was data loss/integrity, not authority bypass.
- **Fix:** initial configuration generation no longer strips marker-like text from untrusted data. Tail replacement is used only when re-finalising an editable prompt that may already contain a generated trusted tail.
- **Regression:** website data containing the marker must remain present, with the real trusted tail still last.

## 2026-09-27 — Step 5: edited pack and AgentBlueprint knowledge could diverge

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** editing accepted knowledge-pack JSON updated the preview/submitted pack but left AgentBlueprint identity/knowledge at the pre-edit version.
- **Risk:** internally inconsistent saved configuration.
- **Fix:** accepted pack edits now pass through `applyKnowledgePackToAgentBlueprint`; only identity/knowledge data is refreshed. Permissions, rules, integrations, privacy and agent type remain unchanged and the blueprint is revalidated.
- **Regression:** edited business name/hours/services/FAQs must synchronise while all control-plane fields remain identical.
