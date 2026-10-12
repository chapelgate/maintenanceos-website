# Assessment: website preview misses gas and carbon monoxide emergencies

- Live voice/sandbox preview answered "I can smell gas in my kitchen" and "My carbon monoxide alarm is going off" with "I'm not sure. Those details are not on file."
- `classifyCallerIntent` in `packages/sandbox-test-call/src/scripted.ts` returned `emergency` only for `gas leak`, `emergency`, `ambulance`, `fire brigade`, `someone is hurt`, `999`, `911`, `on fire`, `bleeding`, and `collapsed`.
- Anything else fell through to the missing-field reply. The check already ran before booking and other intents; the patterns were too narrow.
- The public preview path is `runBrowserInteractiveReply` in `src/lib/sandbox-test-call.ts`. It replaces the emergency sentence after that classifier.
- Imports of `scripted.ts` are the website sandbox client and the `packages/sandbox-test-call` package. This repository has no golden-phone-line module that imports it. The golden line and its config were not changed.
