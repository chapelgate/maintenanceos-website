# Test

Verdict: verified locally; CI required before merge.

Candidate runtime patch SHA: `4af496798c770af0f7af029a61e63c715f235d9e`.

Reproduction on live pre-fix release `cadce5cf66740984aefb81c290265abe45c7ecd0`:
- target: `https://alleygates.co.uk/`;
- HTTP 200 / `ok:true`;
- `scannerV2.state=COMPLETE`;
- `fetched=0`;
- `knowledgeChunks=0`;
- no sources and no learned business facts.

Candidate verification:
- Scanner V2 foundation/runtime/worker targeted suite: 18/18 PASS;
- new foundation regression proves terminal zero-evidence manifest becomes PARTIAL;
- new worker regression proves persisted job state remains PARTIAL;
- existing evidence-bearing COMPLETE tests remain PASS.

Production telephony, carrier routing, provider credentials, voice runtime and golden phone line were not modified or exercised.
