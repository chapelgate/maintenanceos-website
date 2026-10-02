# Scanner V2 Stage 5 — Deterministic Retrieval Evidence

Status: VERIFIED / READY TO MERGE
Date: 2026-10-02
Base SHA: c254e18ffed82610dcf8fb109965ff0fca478784
Verified retrieval source SHA: bb71e4a3459d77e4402b8180e3d55e07fabf2ae1
Validation run: 37033571509
Validation job: 110926372777

## Implemented

- additive `CorpusIndex` retrieval interface;
- deterministic in-memory BM25-style lexical baseline;
- weighted title / heading / body term frequency (3 / 2 / 1);
- exact phrase bonus;
- exact identifier preservation and boost for phone numbers, email addresses, postcodes, codes, percentages and published GBP values;
- bounded deterministic synonym canonicalisation for pricing, hours, returns, delivery, installation, telephone, location and services;
- stable URL + ordinal + chunk-id tie breaking;
- replacement semantics when a crawl is re-indexed, preventing stale chunk accumulation;
- bounded result limit with hard maximum;
- source-grounded search traces containing chunk ID, canonical URL, heading path, text, score, matched terms and matched identifiers;
- lightweight index statistics for debugging: document count, unique term count and average document length;
- no paid model dependency and no new package/runtime dependency.

## Deterministic verification

Exact code under test:
`bb71e4a3459d77e4402b8180e3d55e07fabf2ae1`

GitHub Actions:
- run 37033571509: PASS;
- targeted Scanner V2 foundation / URL policy / discovery / content / retrieval suite: 53/53 PASS;
- scanner package/relevant test group: 242/242 PASS;
- full repository regression: 367/367 PASS;
- accessibility: 16/16 PASS;
- TypeScript: PASS;
- Next.js 16.3.8 production build: PASS;
- generated routes: 30/30;
- SCANNER_V1_RUNTIME_SOURCE_UNCHANGED=PASS;
- SCANNER_V2_PRODUCTION_ROUTING_CHANGE=0;
- GOLDEN_PHONE_LINE_CHANGE_SURFACE=0.

## Independent NVIDIA included-capacity review

Evolution Engine run 37033414118 / job 110925622538: PASS.

Both existing proven review-only NVIDIA providers reviewed two synthetic, non-confidential Stage 5 contracts:
1. ranking/determinism;
2. paraphrase/safety/source-grounding.

Results:
- nvidia-gpt-oss ranking: PASS, marginal cost USD 0;
- nvidia-gpt-oss paraphrase-and-safety: PASS, marginal cost USD 0;
- nvidia-nemotron ranking: PASS, marginal cost USD 0;
- nvidia-nemotron paraphrase-and-safety: PASS, marginal cost USD 0;
- SCANNER_V2_STAGE5_NVIDIA_REVIEW=PASS.

The NVIDIA lane was used only inside its proven reasoning/review boundary. It was not used as an unproven multi-file code executor.

## Architecture boundary

Stage 5 is additive only. It does not:
- route the public /create path to Scanner V2;
- generate customer answers;
- alter Scanner V1 fetch/extraction/runtime;
- introduce paid embeddings or API-token dependencies;
- create new infrastructure.

The retrieval layer is a baseline index behind an interface. Durable persistence is intentionally deferred to the approved worker/storage stages so Stage 5 does not prematurely create duplicate infrastructure.

## Next boundary

Stage 6 only: source-grounded receptionist corpus retrieval/answer contract.

Stage 6 must:
- consult exact structured facts first;
- search this corpus index;
- answer only from retrieved evidence;
- expose source trace;
- fail honestly when evidence is inadequate;
- keep the complete corpus out of one giant prompt;
- remain off the production path until later acceptance/canary stages.

## Golden phone line

No MaintenanceOS production telephony, carrier routing, live number, provider credentials, production voice runtime or golden phone line was modified, exercised, rerouted, restarted or redeployed.
