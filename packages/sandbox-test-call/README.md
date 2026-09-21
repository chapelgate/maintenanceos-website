# sandbox-test-call

Feature-flagged **sandbox session + scripted test-call** foundation for ReceptionistOS / MaintenanceOS.

This is a **standalone Node package** (plus an optional HTTP companion). It is **not** a Next.js API route. The marketing site stays `output: 'export'` on DigitalOcean static hosting.

**Status:** local / staging foundation. **Off by default.** Not wired to live telephony. Do **not** invent a successful live phone call. Do **not** claim Fonio-parity voice quality.

## What this is for

Toward Fonio’s “call my receptionist” loop, without touching the frozen live voice path (Render `maintenanceos-redteam-v2` or similar). v1 can:

| Action | Meaning |
| --- | --- |
| Create / describe session | In-memory sandbox session from draft fields: `businessName`, `greeting`, `hours`, `services`, `faqs`. `kind: "sandbox"`. `liveNumber` is always `null`. |
| Start scripted test | Deterministic transcript against those draft fields. Missing fields are stated as missing. Status is `scripted_demo_complete` only. |
| WebRTC / live media | Returns `not_configured` (or `live_call_forbidden` for `live` / `twilio`). Never `ok: true` with `liveCall: true`. |

This PR does **not** provision a production Twilio number and does not rewrite the frozen receptionist path.

## Flags

| Env | Default | Purpose |
| --- | --- | --- |
| `SANDBOX_TEST_CALL_ENABLED` | `false` | Master switch. When not `true`/`1`, the engine returns `sandbox_disabled` and the HTTP companion answers `503`. |
| `ONBOARDING_SANDBOX_CALL` | `false` | Documented alias for the master switch (same truthy values). |
| `SANDBOX_TEST_CALL_HOST` | `127.0.0.1` | Companion bind address (keep loopback unless you intend otherwise). Hosted companions must use `0.0.0.0`. |
| `SANDBOX_TEST_CALL_PORT` | `8790` | Companion listen port. If unset, `PORT` is used (Render injects this). |
| `SANDBOX_TEST_CALL_CORS_ORIGIN` | echo request `Origin`, else `*` | CORS for the static site. One origin string; unset to allow seahorse-app and chapelgate staging together. |

Marketing UI uses a **separate** build-time flag, `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` (also default false). Static export inlines `NEXT_PUBLIC_*`. See repo `.env.example`, `docs/SANDBOX_TEST_CALL_CONTRACT.md`, and the $0 host runbook `docs/SANDBOX_DEPLOY.md`.

## Run the companion locally

From the website repo root (Node 22+):

```bash
# Terminal 1 — companion still disabled until the flag is on
npm run sandbox-test-call

# Enable sandbox sessions for local/staging only
SANDBOX_TEST_CALL_ENABLED=true npm run sandbox-test-call
```

Health:

```bash
curl -s http://127.0.0.1:8790/health
```

Create a session and run a scripted test:

```bash
curl -s -X POST http://127.0.0.1:8790/v1/sandbox/sessions \
  -H 'Content-Type: application/json' \
  -d '{"businessName":"Acme Plumbing","greeting":"Warm homes","hours":"Mon–Fri 08:00–17:00","services":"Boiler repair","faqs":"Q: London?\nA: Yes."}'

curl -s http://127.0.0.1:8790/v1/sandbox/sessions/sandbox_sess_1

curl -s -X POST http://127.0.0.1:8790/v1/sandbox/sessions/sandbox_sess_1/test-call \
  -H 'Content-Type: application/json' \
  -d '{"mode":"scripted"}'
```

WebRTC / live media (honest failure — no invented call):

```bash
curl -s -X POST http://127.0.0.1:8790/v1/sandbox/sessions/sandbox_sess_1/test-call \
  -H 'Content-Type: application/json' \
  -d '{"mode":"webrtc"}'
# → 503 { "ok": false, "error": "not_configured", "liveCall": false }

curl -s -X POST http://127.0.0.1:8790/v1/sandbox/sessions/sandbox_sess_1/test-call \
  -H 'Content-Type: application/json' \
  -d '{"mode":"live"}'
# → 403 { "ok": false, "error": "live_call_forbidden", "liveCall": false }
```

### Point `/create` at it

```bash
# Terminal 2 — marketing site (static export inlines NEXT_PUBLIC_*)
NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED=true \
NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT=http://127.0.0.1:8790/v1/sandbox \
  npm run dev
```

If the public flag is on but the endpoint is empty, `/create` uses an **in-browser scripted stub** labelled as local testing only. If the flag is off (default), the page says **Sandbox test call — under testing / coming** and does not invent a live call.

DigitalOcean static hosting cannot run this process. Staging `/create` needs a **separate** free-tier service (Render web service, not the frozen voice app) and a DigitalOcean **rebuild** after setting `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` and `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT`. Runbook: `docs/SANDBOX_DEPLOY.md`. No paid plan is required. WebRTC / live media stay `not_configured` / `live_call_forbidden` — never invent a successful live call.

## Plug into ReceptionistOS

```ts
import { createSandboxEngine } from "@maintenanceos/sandbox-test-call";

const sandbox = createSandboxEngine(); // respects SANDBOX_TEST_CALL_ENABLED
const session = sandbox.createSession({
  businessName: "Acme Plumbing",
  greeting: "Warm homes",
  hours: "Mon–Fri 08:00–17:00",
  services: "Boiler repair",
  faqs: "",
});
if (session.ok) {
  const test = sandbox.startTest({ sessionId: session.data.id, mode: "scripted" });
}
```

Do not call this from frozen live voice paths. Feature-flag any future media wiring. Never treat `scripted_demo_complete` as a carrier call.

## Tests

From repo root: `npm test` (includes `src/*.test.ts` here).

```bash
node --experimental-strip-types --test packages/sandbox-test-call/src/*.test.ts
```

Coverage: flag default off, alias flag, scripted demo uses draft / states missing fields, `webrtc` → `not_configured`, `live` → `live_call_forbidden`, companion `503` when disabled.
