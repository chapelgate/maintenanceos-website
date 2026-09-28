# Website receiver contract verification — 2026-09-28

Scope: Step 3 website verification only. No production telephony, Twilio, voice routing, or receiver deployment.

Website baseline: c27f8a1cdfd3964b306a60ae4147cf25d395d6ab
Verified receiver contract: chapelgate/cloud-workers b5f3368d2d7810688e0b7e9e202938a3414cacc2
Receiver tree: dd101359f44f93c28b2363b6752cae73c278d33b

The existing throttled mobile browser harness now has a production-contract mode. It builds the website against the real production receiver URL, then Chrome DevTools Fetch interception stops matching receiver requests before they leave the machine and returns the verified backend response shapes.

Verified normal response: HTTP 200, mode=accepted, durable reference, confirmation_email=accepted.
Verified degraded response: HTTP 202, mode=accepted, durable reference, confirmation_email=failed.

Production-contract mobile result: PASS at 390x844@3, CPU throttle 6, 250 ms latency, 1400 ms JS delay. Exactly 2 POSTs produced 2 stored-request simulations and 1 email handoff; response codes were [200, 202]. No duplicate submit, unexpected navigation, runtime exception, or Step 1 reset occurred. Production UI showed Request received for both outcomes, provider-accepted confirmation for success, and do-not-resubmit degraded copy for email failure.

Preview-path regression: PASS under the same mobile throttling with exactly 2 POSTs, 2 stored-request simulations and 1 email handoff.

The harness also asserts each create payload remains over the obsolete 3,000-character receiver limit and carries a stable bounded submission_id. This is verification tooling only; product behavior is unchanged.
