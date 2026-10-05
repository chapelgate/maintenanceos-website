# Assessment

## Goal lock

OBJECTIVE -> prevent Scanner V2 from reporting COMPLETE when a crawl has no fetched or duplicate evidence.

ACCEPTANCE CRITERION -> a terminal frontier with zero fetched evidence is PARTIAL; normal evidence-bearing crawls can still become COMPLETE; live Alley Gates zero-evidence case no longer lies about completeness.

EVIDENCE/BLOCKER -> exact live Scanner V2 release `cadce5c` returned `ok:true`, `state:COMPLETE`, `fetched:0`, `knowledgeChunks:0`, no sources and no learned facts for `https://alleygates.co.uk/`. The worker finalizer set COMPLETE solely from absence of queued/unresolved rows. Proven guards already exist on the prior Scanner V2 persistent-runtime branch but were not ancestors of the deployed release.

NEXT ACTION -> port only the existing worker/foundation completeness guards and their original regression tests.

## Reuse / preflight

- Reuse proven commits/hunks `1877692`, `7e96f21`, `08f0f8a`, `da3a982`.
- No new service, queue, database, router, model, credential or control plane.
- No telephony/voice/golden-line change.
- Estate preflight: yes.
- Work class: BUG.
