# WebsiteOS architecture map

Rendered Archify (v3.2.0) architecture diagram: [ARCHITECTURE.html](./ARCHITECTURE.html)
Generated from `.archify/architecture-websiteos-20261020-1751/candidate.json` at repo revision
`dfa183ad4ec730f334bfe53fb9ec4423a862fac9` (branch `crr/2026-10-20`). Archify `finalize`
passed all gates: validate, deliver, check, browser-check (receipts kept locally under
`.archify/`, untracked). Automated checks passed; not visually reviewed.

## Summary (5 lines)

1. WebsiteOS is a Next.js static export (marketing site) served from DigitalOcean App Platform; every server-side behaviour lives outside the static bundle.
2. Same-origin site calls: the `/api/chat` route forwards chat messages to an operator webhook (or logs them when unset), and `/api/website/*` DigitalOcean Functions proxy the `/create` website check and the receptionist voice preview.
3. The scan function forwards each check to the droplet-hosted onboarding scanner (`packages/onboarding-ingest`), and the voice function calls Google's Gemini TTS API with a server-side key.
4. Four flag-gated Node companions (calendar adapters `:8789`, sandbox test call `:8790`, customer dashboard `:8791`, provisioning gateway `:8792`) default off and bind `127.0.0.1`; the browser reaches only the first three, and only when build-time flags bake in absolute endpoints.
5. The provisioning gateway is internal-only: HMAC-SHA256-authenticated Agent Factory control-plane callers may POST, any browser `Origin` is rejected with 403, and the diagram deliberately has no site-to-gateway edge.

## Node evidence

| Node | Evidence file:line | Verdict | Note |
|---|---|---|---|
| Visitor | next.config.ts:16 | CORRECT | External actor (no source required by schema); entry point corroborated by static-export serving. |
| WebsiteOS site | next.config.ts:16; src/app/layout.tsx:24; src/app/page.tsx:65 | CORRECT | `output: "export"` static export; root layout and home page exist; DO App Platform static per WEBSITE_ARCHITECTURE.md D2. |
| Chat API | src/app/api/chat/route.ts:29 | CORRECT | `POST` route handler at `/api/chat`; "serverless" hosting claim from the first draft was dropped (no deploy evidence). |
| Operator webhook | src/app/api/chat/route.ts:14 | CORRECT | `CHAT_WEBHOOK_URL` env configures the forward target. |
| Lead adapter | src/lib/lead-adapter.ts:92 | CORRECT | `submitLead` client module posts JSON; honeypot + validation included. |
| Form endpoint | src/config/site.ts:49; src/components/LeadCaptureForm.tsx:184 | CORRECT | `formEndpoint` from `NEXT_PUBLIC_FORM_ENDPOINT`; empty/retired-host builds branch to a mailto link (LeadCaptureForm.tsx:184-201). |
| Scan function | src/config/site.ts:61; packages/onboarding-ingest/packages/website/scan/index.ts:22; :140 | CORRECT | Same-origin `/api/website/scan`, routed to DigitalOcean Functions; proxies to droplet upstream `https://178-128-171-45.sslip.io/v1/onboarding/scan`. |
| Onboarding scanner | packages/onboarding-ingest/src/server.ts:19; docs/ONBOARDING_SCAN_DEPLOY.md:8 | CORRECT | Node scan service, default `127.0.0.1:8788`, `/v1/onboarding/scan`; droplet runbook confirms it is a separate Node process. |
| Voice function | src/lib/preview-voice.ts:15; packages/onboarding-ingest/packages/website/voice/index.ts:5; :84 | CORRECT | `/api/website/voice` DO Function entry; `GEMINI_HOST = generativelanguage.googleapis.com`. |
| Gemini TTS | packages/onboarding-ingest/packages/website/voice/index.ts:457; :461 | CORRECT | `…/models/<model>:generateContent` endpoint fetched with `x-goog-api-key` header (:464). |
| Calendar adapters | packages/calendar-adapters/src/server.ts:35 | CORRECT | Default `127.0.0.1:8789`; `/v1/calendar/slots|bookings` routes plus Google/Microsoft OAuth start/callback. |
| Google Calendar | packages/calendar-adapters/src/oauth.ts:215 | CORRECT | Companion-side authorize URL `accounts.google.com/o/oauth2/v2/auth`. |
| Microsoft Calendar | packages/calendar-adapters/src/oauth.ts:259 | CORRECT | Companion-side authorize URL `login.microsoftonline.com/.../authorize`. |
| Sandbox test call | packages/sandbox-test-call/src/server.ts:18 | CORRECT | Default `127.0.0.1:8790`; `/v1/sandbox/sessions*`; `telephony: false`, scripted engine. |
| Customer dashboard | packages/customer-dashboard/src/server.ts:21 | CORRECT | Default `127.0.0.1:8791`; GET-only `/v1/dashboard/sessions|bookings`; SAMPLE/demo catalogue. |
| Provisioning gateway | packages/provisioning-gateway/src/server.ts:42; :267-274; docs/PROVISIONING_GATEWAY_CONTRACT.md:45 | CORRECT | Default `127.0.0.1:8792`; `POST /v1/provisioning/requests`; any `Origin` header is rejected 403 (server.ts:267-274). |
| Agent Factory caller | docs/PROVISIONING_GATEWAY_CONTRACT.md:4; packages/provisioning-gateway/src/server.ts:3 | CORRECT | Contract audience is "trusted internal control-plane callers only"; the caller itself is outside this repo. |

## Edge evidence

| Edge | Evidence file:line | Verdict | Note |
|---|---|---|---|
| Visitor → WebsiteOS site (HTTPS) | next.config.ts:13-16 | CORRECT | Static export served to the browser; "DigitalOcean App Platform static" per config comment and WEBSITE_ARCHITECTURE.md D2. |
| WebsiteOS site → Chat API (POST /api/chat) | src/components/ChatWidget.tsx:50-51 | CORRECT | Client widget POSTs same-origin `/api/chat`; widget mounted on /create and industry pages. |
| Chat API → Operator webhook (fetch JSON or log) | src/app/api/chat/route.ts:56-73 | CORRECT | Forwards JSON payload when configured; otherwise `console.log`s it. |
| WebsiteOS site → Lead adapter (capture lead) | src/components/LeadCaptureForm.tsx:213; src/components/CreateReceptionistLaterSteps.tsx:793 | CORRECT | Both call sites import and invoke `submitLead`. |
| Lead adapter → Form endpoint (POST when configured) | src/lib/lead-adapter.ts:117-118 | CORRECT | `fetch(endpoint, { method: "POST" … })`; unconfigured builds never POST (mailto branch instead). |
| WebsiteOS site → Scan function (website check) | src/components/CreateReceptionistLaterSteps.tsx:460,477; src/lib/onboarding-create.ts:888-896 | CORRECT | `/create` reads `siteConfig.onboardingScanEndpoint` and POSTs `{ url, crawlId }`. |
| Scan function → Onboarding scanner (scan request) | packages/onboarding-ingest/packages/website/scan/index.ts:140-149 | CORRECT | Function POSTs to `scannerRuntimeUrl()`; default is the droplet `…/v1/onboarding/scan` (:21-22). |
| WebsiteOS site → Voice function (speak preview) | src/components/SandboxTestCallPanel.tsx:13; src/lib/preview-voice.ts:418-423 | CORRECT | `speakReceptionistText` POSTs text to `/api/website/voice`; falls back to browser voice on failure. |
| Voice function → Gemini TTS (generateContent TTS) | packages/onboarding-ingest/packages/website/voice/index.ts:457-464 | CORRECT | Server-side key in `x-goog-api-key`; browser never receives it. |
| WebsiteOS site → Calendar adapters (slots/bookings (flag)) | src/components/CalendarConnectPanel.tsx:23-24; src/lib/calendar-create.ts:253-254 | CORRECT | Gated by `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` (site.ts:66-69); flag off renders "coming soon" panel, no fetch. |
| Calendar adapters → Google Calendar (OAuth start/callback) | packages/calendar-adapters/src/server.ts:243-268; packages/calendar-adapters/src/oauth.ts:215 | CORRECT | Companion serves `/oauth/google/start` + `/callback`; mock provider unless credentials configured. |
| Calendar adapters → Microsoft Calendar (OAuth start/callback) | packages/calendar-adapters/src/server.ts:271-296; packages/calendar-adapters/src/oauth.ts:259 | CORRECT | Companion serves `/oauth/microsoft/start` + `/callback`. |
| WebsiteOS site → Sandbox test call (test call (flag)) | src/components/SandboxTestCallPanel.tsx:85-87; src/lib/sandbox-test-call.ts:373-374 | CORRECT | Gated by `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` (site.ts:80-83); POSTs `/v1/sandbox/sessions…`. |
| WebsiteOS site → Customer dashboard (GET demo rows (flag)) | src/components/CustomerDashboard.tsx:30-31; src/lib/customer-dashboard.ts:399-400 | CORRECT | Gated by `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` (site.ts:95-98); GET-only; in-browser mock when endpoint unset. |
| Agent Factory caller → Provisioning gateway (authenticated POST) | docs/PROVISIONING_GATEWAY_CONTRACT.md:4-5; packages/provisioning-gateway/src/server.ts:328-344; packages/provisioning-gateway/src/auth.ts:75 | CORRECT | HMAC-SHA256-signed headers verified server-side; browser use forbidden by contract and by the 403 Origin check. |

## Totals

- Nodes: 17 correct / 0 wrong / 0 unverified.
- Edges: 15 correct / 0 wrong / 0 unverified.

Corrections vs the first draft candidate (failed `validate`, previous session): the invented
"WebsiteOS site → Provisioning gateway (authenticated)" edge was removed: `rg` finds no
provisioning call in `src/`, and the gateway rejects any browser `Origin` (server.ts:267-274);
the Chat API's "serverless" sublabel was dropped as unverified; the two DigitalOcean Functions,
the droplet scanner, Gemini TTS and the Agent Factory caller were added as evidenced nodes;
companion OAuth edges were re-sourced from `src/lib/integrations.ts` (marketing-page config)
to the companion's own OAuth implementation.

## Wall clock and gotchas

- Wall clock: 240 minutes end to end (17:51-21:51 local), including a 57-minute gap after the
  first session stalled on the failed `validate`; the resumed session took 183 minutes.
- Gotcha: the label-gap check measures real rendered label width plus ~17 px; the
  `6.5 px × chars + 21 px` budget in the authoring defaults is conservative. Budget ≥120 px gaps
  for medium labels or the validator fails with `composition/label-gap`.
- Gotcha: automatic port spreading on a shared side orders ports by the counterpart's centre
  along that side (see `automaticPortSpread` in the renderer); three fan-out targets in one
  column tie on `cx`, fall back to connection-id order, and crossed routes. Staggering target
  `x` so the deepest target sits leftmost fixed both crossings in a single positions-only edit;
  the rerun passed with zero diagnostics.
- Gotcha: `finalize` writes receipts beside the output; pass `--out-dir <folder>/review-2` on
  reruns so earlier browser evidence stays bound to its artifact bytes, as the skill requires.
- `ARCHIFY_UPDATE_CHECK_DISABLED=1` was set for every archify command; no URL-fetching commands
  were run and no network was used beyond `git push`/`gh`.
