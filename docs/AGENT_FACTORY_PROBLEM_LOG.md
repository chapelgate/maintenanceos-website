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

## 2026-09-27 — Step 6: scanner provenance was discarded by the create UI

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** onboarding scan returned `factMeta`, but `/create` stored only `facts` and `fieldMeta`; structured source/confidence was not available to final review.
- **Fix:** retain `factMeta`, show source/confidence on review fields, and persist it with the review evidence.

## 2026-09-27 — Step 6: no mandatory customer confirmation gate

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** generated pack/prompt could be submitted as an early-access lead without explicit confirmation of business identity, low-confidence facts, consequential capabilities, missing data or generated AI output.
- **Fix:** pure fail-closed review policy plus accessible checkbox gate; edits invalidate previous confirmations and final submission is disabled until current requirements are complete.

## 2026-09-27 — Step 6: lifecycle marked reviewed before review

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** Step-5 generation set `lifecycle.stage=reviewed` immediately after configuration generation, before customer confirmation.
- **Risk:** a future provisioning consumer could mistake generated-but-unchecked configuration for reviewed configuration.
- **Fix:** configuration generation now preserves `draft`; only `finalizeAgentReview` may advance to `reviewed`, and it rejects incomplete or forged review evidence.

## 2026-09-27 — Step 6: structured identity gaps were absent from missing-data acknowledgement

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** legacy knowledge-pack `missing` covered pack fields but not locations/contact details.
- **Fix:** Step-6 review derives structured identity gaps directly from the validated AgentBlueprint and includes them in the mandatory missing-information acknowledgement.

## 2026-09-27 — Step 6: review finaliser trusted caller-supplied requirement bookkeeping

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** the first Step-6 finaliser validated a review record against IDs supplied by the caller; an externally forged empty requirement set could weaken the lifecycle guard outside the normal UI path.
- **Fix:** `finalizeAgentReview` now derives the current canonical requirement set internally from the validated blueprint, provenance and missing-data inputs, rebuilds canonical review evidence, and rejects any inconsistent record.
- **Regression:** forged empty requirement records and records missing newly-required low-confidence/missing checks must fail.

## 2026-09-27 — Step 6: review evidence was not bound to the exact AI output

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** checkbox IDs alone could remain structurally valid after prompt/pack content changed.
- **Fix:** review records now carry a deterministic `revisionId` derived from the exact validated AgentBlueprint + knowledge pack + final system prompt. Lifecycle stage is normalised so the revision stays stable across the draft-to-reviewed transition.
- **Note:** the revision ID is a stale-evidence/change detector, not a cryptographic authorization token.
- **Regression:** changing prompt or pack after confirmation invalidates finalisation; reviewed lifecycle preserves the same revision.

## 2026-09-27 — Step 6: edited values retained stale scanner provenance

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** after a customer changed a scanned value, the UI and persisted metadata could still describe the scanner source/confidence as though it supplied the edited value.
- **Fix:** editing draft or structured identity fields clears the corresponding `fieldMeta`/`factMeta` provenance and all previous confirmations.

## 2026-09-27 — Step 6: pack edits could leave stale embedded prompt business data

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** accepted knowledge-pack JSON edits updated the pack/blueprint but re-finalised the old prompt text, leaving its embedded business-data section stale.
- **Fix:** accepted pack edits regenerate the complete role-specific system prompt from the updated pack, then require fresh review confirmations.

## 2026-09-27 — Step 6: reviewed business-name edit could retain old default greeting

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** changing business name while leaving greeting blank could fall back to the pre-edit AgentBlueprint greeting containing the old business name.
- **Fix:** blank greeting now regenerates from the selected role template and reviewed business name; explicit customer greeting still wins.

## 2026-09-27 — Step 6: final stored prompt was not directly visible

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** the editor showed editable prompt content and explained trusted controls were re-applied, but did not display the exact final stored prompt.
- **Fix:** add a read-only expandable final system-prompt view so the mandatory AI-output confirmation can cover the actual stored output.

## 2026-09-27 — Step 6: stale review evidence could outlive configuration/provenance changes

- **State:** FIX CANDIDATE — execution verification pending.
- **Risk:** checkbox IDs alone did not prove that the same blueprint, pack, protected prompt and provenance were still being reviewed after later edits.
- **Fix:** deterministic review revision now binds blueprint + knowledge pack + protected system prompt + fact/field provenance + missing-data state. Finalisation recomputes the canonical revision and requirements.
- **Boundary:** revision ID is a stale-change/audit fingerprint, not a server authentication signature.

## 2026-09-27 — Step 6: review helpers accepted later lifecycle stages

- **State:** FIX CANDIDATE — execution verification pending.
- **Risk:** a future caller could reuse edit/finalise helpers against a reviewed/provisioning/active blueprint.
- **Fix:** customer identity edits and lifecycle finalisation now require `lifecycle.stage=draft`; non-draft inputs fail closed.

## 2026-09-27 — Step 6: raw pack edits retained stale scanner provenance

- **State:** FIX CANDIDATE — execution verification pending.
- **Risk:** customer-edited pack values could still be labelled with confidence metadata from the pre-edit scanner result.
- **Fix:** accepted raw pack edits clear draft-field scanner provenance and regenerate the protected system prompt before review confirmations can be re-entered.

## 2026-09-27 — Step 6: asynchronous pack/prompt edits could commit stale state

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** dynamic import callbacks for pack/prompt/reset edits had no generation guard, so an older callback could theoretically commit after a newer edit; confirmations cleared only at edit start could also be re-selected before the async commit.
- **Fix:** one monotonic `configEditVersionRef` rejects stale callbacks; current commits clear confirmations again, and leaving the Pack step invalidates outstanding callbacks.
- **Regression:** `scripts/agent-review-wiring.test.mjs` locks the guard and stale-provenance/reset wiring.

## 2026-09-27 — Step 6: editable views could differ from normalized stored output

- **State:** FIX CANDIDATE — execution verification pending.
- **Reproduction:** unknown pack keys are dropped by normalization and trusted prompt controls are appended after editing, but the editable textareas alone did not show those exact stored results.
- **Fix:** expose read-only `Final normalized knowledge pack` and `Final stored system prompt` views for the mandatory AI-output review.

## 2026-09-27 — Step 6: async generation/edit race could submit stale configuration

- **State:** FIX CANDIDATE — execution verification pending.
- **Risk:** Step-4 generation and Step-5 pack/prompt/reset edits use dynamic imports. Without a pending gate, a customer could change input, navigate, or re-confirm while an older async result was still resolving.
- **Fix:** all generation/edit operations share a monotonic version counter and `configEditPending` gate. Newer edits/back navigation invalidate older completions; review checkboxes and final submit are disabled while the latest change is unsettled.
- **Regression:** `scripts/agent-review-wiring.test.mjs` locks the version/pending guards, stale-result rejection, provenance invalidation and regenerated protected prompt wiring.

## 2026-09-27 — Step 5/6 execution verification closure

- **State:** CLOSED / VERIFIED.
- Real verifier: authorised Desktop Commander device `CG`.
- Integrated candidate: `55fd405c022fe8dbac19860fcd68f36ba6f7ff40`.
- Latest MaintenanceOS compatibility baseline: `5eb0f92f2633e20e4d280835d3e6577e3f206c8b`.
- Focused TypeScript tests: 63/63 PASS.
- Focused wiring/accessibility tests: 11/11 PASS.
- Changed-file ESLint: PASS.
- Full repository tests: 241/241 PASS.
- Next.js 16.3.6 production build and TypeScript: PASS.
- Static export: 30/30 routes generated.
- Clean-tree check: PASS.
- Verification found and repaired before closure: a schema-invalid prompt-pressure fixture, explicit checkbox accessibility association, and nullable submit-path TypeScript narrowing.
- No live telephony/provider/carrier/database/infrastructure files were changed.


## 2026-09-27 — Step 7: effect-based sandbox reset violated React lint

- **State:** CLOSED / VERIFIED FIX.
- **Reproduction:** initial Step-7 wiring synchronously reset multiple local sandbox UI states inside a React effect when the review revision changed.
- **Verifier evidence:** changed-file ESLint rejected the pattern under `react-hooks/set-state-in-effect`.
- **Root cause:** review-revision invalidation was correctly required, but an effect was the wrong React mechanism for resetting purely local component state.
- **Fix:** remove the effect and key the sandbox panel by the exact review revision so React remounts the local sandbox UI naturally. Parent qualification state is still invalidated explicitly.
- **Scope impact:** UI-state/reset logic only; no product runtime or telephony change.


## 2026-09-27 — Step 7 sandbox qualification verification closure

- **State:** CLOSED / VERIFIED.
- Exact pre-closure engineering candidate: `d8250ec42281c5202e17329d482538646588692b`.
- MaintenanceOS compatibility baseline: `5eb0f92f2633e20e4d280835d3e6577e3f206c8b`.
- Focused Step-7 + adjacent TypeScript tests: 54/54 PASS.
- Repository script suite: 216/216 PASS.
- Package/runtime/source TypeScript suite: 249/249 PASS.
- Changed-file ESLint: PASS.
- Next.js 16.3.6 production build and TypeScript: PASS.
- Static export: 30/30 routes generated.
- Clean-tree check: PASS.
- Sandbox qualification is companion-only, revision-bound and fail-closed; browser mock remains demonstration-only.
- Successful qualification changes lifecycle only from `reviewed` to `sandbox_passed`.
- No live phone call, number provisioning, provider/carrier, database, deployment or infrastructure mutation occurred.
