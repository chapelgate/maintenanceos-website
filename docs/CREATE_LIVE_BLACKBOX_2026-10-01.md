# MaintenanceOS /create live black-box verification — 2026-10-01

## Scope

Website only. This verification does not modify or exercise the live telephone line, carrier routing, provisioning adapters, or provider credentials.

## Source and deployment identity

- Repository: `chapelgate/maintenanceos-website`
- Verified live application source: `ef3697eb285092b7db360cb54939d156e5e8461d`
- Host: existing DigitalOcean App Platform site
- Live `/release.json`: exact SHA match
- Live `/create/`: HTTP 200

## Public copy audit

The live rendered /create response was reduced to visitor-visible text by removing scripts, styles, and markup before checking customer-facing wording.

Result:
- `sandbox`: 0 visible occurrences
- `under test`: 0 visible occurrences
- `under testing`: 0 visible occurrences
- `Try your receptionist`: present
- `Check the URL`: present
- `Preview`: present

Internal source identifiers may still use engineering terms; the public rendered wording does not.

## Website-learning production probe

`POST /api/website/scan` with `https://example.com` returned HTTP 200 and:
- business name: `Example Domain`
- fetched website fact
- source/confidence provenance
- explicit warnings for facts not found

A separate probe of `https://alleygates.co.uk` returned HTTP 422 with `fetch_failed`, `robots_unavailable`, and `http_401`. Because a second public target succeeded immediately, this is recorded as a target-site fetch refusal, not a scanner-service outage. The application remained fail-closed and invented no crawl results.

## Real-browser acceptance

The repository's existing CDP acceptance harness was reused against the live production origin with Microsoft Edge.

Environment:
- viewport: 390x844
- device scale factor: 3
- live network and same-origin production scanner
- speech recognition/synthesis replaced only inside the QA browser with deterministic test doubles so microphone and spoken-reply behaviour could be asserted without ambient-audio dependence

Journey proved:
1. Open live /create.
2. Enter `https://example.com`.
3. Website learning runs exactly once.
4. Review receives `Example Domain`.
5. Configure receptionist and reviewed services `Boiler repairs` and `Emergency plumbing`.
6. Generate reviewed configuration.
7. Primary action is `Try your receptionist`.
8. No production lead/email request has fired.
9. Start browser voice call.
10. Browser speech input asks `What services do you offer?`.
11. Transcript answer includes the reviewed services.
12. Spoken answer includes the reviewed services.
13. Production lead/email requests remain 0.
14. Runtime exceptions remain 0.

Machine result:

```json
{"ok":true,"siteOrigin":"https://seahorse-app-4oasq.ondigitalocean.app","viewport":"390x844@3","primaryAction":"Try your receptionist","websiteLearning":true,"voiceCall":true,"callerQuestion":"What services do you offer?","packAwareReply":true,"spokenReply":true,"leadRequestsBeforeOptionalSave":0,"runtimeExceptions":0}
```

## Engineering decision

No product defect was reproduced in the combined production journey, so no runtime change was justified. Adding another browser framework or a duplicate live-test implementation would increase churn. The existing reviewed harness was adapted ephemerally for this proof.

## Freeze procedure

Merge this evidence-only record through the normal PR path. Wait for the existing DigitalOcean native deployment to expose the exact merge SHA in `/release.json`, rerun the same live black-box journey, then create tag:

`maintenanceos-website-create-scan-voice-live-20261001`

Only that post-merge, reverified SHA is the final freeze point.
