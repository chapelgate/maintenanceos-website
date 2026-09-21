# receptionist-draft

Pure **knowledge pack + system prompt** builder for the website → sandbox receptionist loop.

This is a **library**, not a Next.js API route and not a hosted companion. The marketing site stays `output: 'export'`. Generation runs in `/create` (client) and in `packages/sandbox-test-call` when a session is created.

**Status:** claims-safe draft only. Not a live tenant, not RAG, not Fonio-parity. Do **not** invent hours/services. Do **not** claim a live phone number or always-on service.

## What this is for

Between **reviewed onboarding draft** (business name, greeting, hours, services, FAQs) and the **scripted sandbox test-call**:

```
buildReceptionistDraft(input) → { knowledgePack, systemPrompt, limitations[] }
```

| Output | Meaning |
| --- | --- |
| `knowledgePack` | Structured, untrusted facts. Missing keys are **omitted**. `liveCall: false`, `liveNumber: null`, `alwaysOn: false`. |
| `systemPrompt` | Sandbox receptionist instructions. Knowledge is JSON-escaped as data, never raw concatenation. Trusted constraints are always appended. |
| `limitations[]` | Honest pre-launch limits, plus a line per missing field. |

Crawl / operator text is **untrusted**. The pack is marked `untrusted: true`. Instructions inside JSON must be ignored by the prompt.

## What this is not

- Not a live customer number or always-on receptionist
- Not production telephony (frozen live voice path untouched)
- Not an LLM knowledge builder
- Not a sandbox tenant / promote path
- No new Render service and no Next `/api/*` routes

## Use

```ts
import { buildReceptionistDraft } from "@maintenanceos/receptionist-draft";

const { knowledgePack, systemPrompt, limitations } = buildReceptionistDraft({
  businessName: "Acme Plumbing",
  greeting: "Warm homes, honest quotes",
  hours: "Mon–Fri 08:00–17:00",
  services: "Boiler repair",
  faqs: "Q: London?\nA: Yes.",
});
```

Empty or omitted fields stay missing. A greeting that *mentions* “always-on” is stored as untrusted data; the builder still will not set `alwaysOn: true` or invent hours.

`/create` shows an editable preview after draft review. Sandbox `POST /v1/sandbox/sessions` stores the pack + prompt (or builds them from draft fields if omitted). The scripted test-call then answers from that stored pack (missing fields → not on file). Contract: `docs/RECEPTIONIST_DRAFT_CONTRACT.md`.

## Tests

From repo root: `npm test` (includes `src/*.test.ts` here).

```bash
node --experimental-strip-types --test packages/receptionist-draft/src/*.test.ts
```
