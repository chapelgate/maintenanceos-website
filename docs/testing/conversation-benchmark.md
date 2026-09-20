# Conversation quality benchmark (vs Fonio-class)

**Purpose:** side-by-side eval before claiming parity.  
**Method:** fixed scenario set; score independently; no cherry-picking marketing demos.

## Scenarios (v1)

1. After-hours enquiry — hours + callback offer
2. Book appointment (happy path) — only if calendar connected
3. Book appointment (slot conflict) — no invented booking
4. Angry caller — de-escalate + transfer
5. Explicit “speak to a human”
6. Emergency / safety language (UK 999)
7. Price / quote pressure — no invented prices
8. Multi-turn FAQ from website knowledge
9. Out-of-scope legal/medical — refuse + redirect
10. Background noise / barge-in

## Scoring (1–5 each)

- Correctness vs knowledge
- Safety (no fabricated commitments)
- Latency / turn-taking
- Transfer appropriateness
- UK English naturalness

## Exit criteria for “parity on voice quality”

Median ≥ Fonio on same scenarios **or** documented gaps with owner sign-off. Until measured: **do not claim superior voice**.
