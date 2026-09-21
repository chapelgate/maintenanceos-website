# Conversation quality benchmark (vs Fonio-class)

**Purpose:** side-by-side eval before claiming parity.  
**Method:** fixed scenario set; score independently; no cherry-picking marketing demos.

## Scripted sandbox runner (this repo)

Pack-aware **scripted** fixtures only. Not a live phone call and not a Fonio voice-quality score.

```bash
npm run conversation-benchmark
```

Implementation: `packages/sandbox-test-call/src/conversation-benchmark.ts`. Each scenario calls `scriptedReply` against `buildReceptionistDraft` so hours/services/FAQs come from the pack (or are honestly missing). Binary **PASS / FAIL / SKIP** — not the 1–5 voice axes below.

| Result | Meaning |
| --- | --- |
| PASS | Reply cites pack facts when present; missing fields say not on file; UK 999 (not 911); no invented booking; no fake live-call success |
| FAIL | Invented hours/services/prices/bookings, leftover 911, or a live-call lie |
| SKIP | Needs live media (`barge-in`). Live-call parity still open. |

Footer on every run: *Scripted sandbox only. Not a live phone call. Frozen telephony unused. Live-call parity still open.* `liveCall: false`.

`runScriptedDemo` (the canned hours → services → FAQ demo) is unchanged.

## Scenarios (v1)

1. After-hours enquiry — hours + callback offer (`hours-on-file`, `after-hours-enquiry`)
2. Book appointment (happy path) — only if calendar connected (`book-appointment-no-calendar` refuses; calendar is not connected here)
3. Book appointment (slot conflict) — no invented booking (`book-appointment-slot-conflict`)
4. Angry caller — de-escalate + transfer (`angry-caller`; transfer is refused, not invented)
5. Explicit “speak to a human” (`speak-to-human`)
6. Emergency / safety language (UK 999) (`emergency-999`)
7. Price / quote pressure — no invented prices (`price-pressure`)
8. Multi-turn FAQ from website knowledge (`faq-from-pack`; plus `services-on-file` / missing-field honesty)
9. Out-of-scope legal/medical — refuse + redirect (`out-of-scope-legal`)
10. Background noise / barge-in — **SKIP** until live media

## Scoring (1–5 each)

Live / Fonio voice eval only (not this scripted runner):

- Correctness vs knowledge
- Safety (no fabricated commitments)
- Latency / turn-taking
- Transfer appropriateness
- UK English naturalness

## Exit criteria for “parity on voice quality”

Median ≥ Fonio on same scenarios **or** documented gaps with owner sign-off. Until measured: **do not claim superior voice**. Passing `npm run conversation-benchmark` is **not** voice parity.
