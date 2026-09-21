# Receptionist draft contract (v0)

**Status:** v0 — pure builder for `/create` + sandbox session consume  
**Implementation:** `packages/receptionist-draft` (`buildReceptionistDraft`)  
**Consumers:** `src/components/CreateReceptionistForm.tsx`, `packages/sandbox-test-call`

This marketing site is a **static export** (`output: 'export'`). There are **no Next.js API routes**. Generation is a **pure function** (client + sandbox companion). No new hosted service and no feature flag are required.

## Function

```
buildReceptionistDraft(input) → { knowledgePack, systemPrompt, limitations[] }
```

`input` is the reviewed onboarding draft: `businessName`, `greeting`, `hours`, `services`, `faqs` (all optional strings).

## Hard limits

- Missing fields stay **omitted**. Never fabricate hours or services.
- `knowledgePack.liveCall` is always `false`. `liveNumber` is always `null`. `alwaysOn` is always `false`.
- The system prompt must not claim a live customer number or always-on production telephony.
- Crawl / operator text is **untrusted**. It is JSON-escaped as data. Trusted constraints are always appended (`[ReceptionistOS trusted constraints]`).
- Not a live tenant. Frozen production telephony is unused. Scripted / sandbox path only.

## Knowledge pack (shape)

```json
{
  "untrusted": true,
  "kind": "sandbox_knowledge_pack",
  "liveCall": false,
  "liveNumber": null,
  "alwaysOn": false,
  "productionTelephony": false,
  "businessName": "Acme Plumbing",
  "hours": "Mon–Fri 08:00–17:00",
  "services": ["Boiler repair"],
  "faqs": [{ "question": "London?", "answer": "Yes." }],
  "missing": ["greeting"]
}
```

Omit a key rather than guess. `missing` lists the five draft keys that were empty.

## `/create` UI

After draft review (step 3), step 4 shows a **compact** editable pack + prompt preview and a **read-only** limitations list (pre-launch, no live number). Submit stores the pack on the early-access lead. The flagged sandbox panel may send pack + prompt on `POST /v1/sandbox/sessions` (one-click scripted demo). If omitted, the companion builds them from draft fields.

## Sandbox consume

`POST /v1/sandbox/sessions` may include `knowledgePack` and `systemPrompt`. The session object always returns a claims-safe pack + prompt + limitations. Scripted test-call answers come from the **stored knowledge pack** (and the system prompt’s missing-field rule). If a pack field is missing, the reply says it is not on file — never invent hours or services.

Never treat this as a live phone call.
