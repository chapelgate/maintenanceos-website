# Deploy sandbox test-call (+ optional mock calendar) on Render free

**Status:** operator runbook — $0 staging companions  
**Code:** `packages/sandbox-test-call` (`npm run sandbox-test-call` → `node --experimental-strip-types packages/sandbox-test-call/src/server.ts`)  
**Contract:** [`SANDBOX_TEST_CALL_CONTRACT.md`](SANDBOX_TEST_CALL_CONTRACT.md)  
**Public env names** (verified in `src/config/site.ts`): `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED`, `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT`  
**Do not:** attach this to DigitalOcean static hosting, add a Next.js API route, or edit frozen live telephony (`maintenanceos-redteam` / production voice on Render).

The marketing site stays `output: 'export'`. `/create` only talks to the companion when `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` is `true`/`1` **and** `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT` is an absolute `https:` URL baked in at **Next build time**. This companion is a **separate** Node process.

Scan remains `docs/ONBOARDING_SCAN_DEPLOY.md` / service `maintenanceos-onboarding-scan`. Do not reuse that service for sandbox.

## What you get

| Item | Value (from source, not assumed) |
| --- | --- |
| Health | `GET /health` → 200 `{ ok, service: "maintenanceos-sandbox-test-call", sandboxEnabled, telephony: false, liveCall: false, liveNumber: null, productionTelephony: false, frozenLivePathUntouched: true, sessionsPath }` even when the flag is off |
| Create session | `POST /v1/sandbox/sessions` with JSON draft fields |
| Describe session | `GET /v1/sandbox/sessions/{id}` |
| Scripted test | `POST /v1/sandbox/sessions/{id}/test-call` `{ "mode": "scripted" }` → `scripted_demo_complete`, `liveCall: false` |
| WebRTC | `{ "mode": "webrtc" }` → **503** `not_configured`, `liveCall: false` — never a successful live call |
| Live / Twilio | `{ "mode": "live" }` → **403** `live_call_forbidden`, `liveCall: false` |
| Local defaults | host `127.0.0.1`, port `8790` (`SANDBOX_TEST_CALL_HOST` / `SANDBOX_TEST_CALL_PORT`) |
| Hosted listen | `SANDBOX_TEST_CALL_HOST=0.0.0.0` and Render’s injected `PORT` (the process also reads `PORT` if `SANDBOX_TEST_CALL_PORT` is unset) |
| Master switch | `SANDBOX_TEST_CALL_ENABLED` (alias `ONBOARDING_SANDBOX_CALL`) — not `true`/`1` → `503 sandbox_disabled`, no session |

Sessions are **in-memory for that process**. A sleep, restart, or new instance forgets them. Create a new session after wake; do not invent a previous transcript.

## $0 host

Chapelgate already runs product/voice on Render. Create a **new** free web service from **this** repo. Do not open or change `maintenanceos-redteam-v2` (or any live voice service). Do not attach this process to `maintenanceos-onboarding-scan`.

`render.yaml` sets `plan: free` on every companion. Render’s Blueprint default is **Starter** (paid) if `plan` is omitted — this file does not omit it.

Free web services sleep after **15 minutes** idle. `/create` may then fail the companion POST. Wake with `GET /health` (wait for HTTP 200) and retry. An existing $0 uptime ping to `/health` (not GitHub Actions cron) can prevent spin-down.

Do **not** add a payment method or raise a spend limit to keep this process up.

## A. Dashboard clicks (authoritative for Free)

Render still requires an explicit **Free** click in the UI even when a Blueprint exists.

1. Open [Render Dashboard](https://dashboard.render.com). Use the Chapelgate workspace that already hosts other MOS services.
2. Top right: **New +** → **Web Service**.
3. Connect GitHub repo `chapelgate/maintenanceos-website` (not the pilot/redteam repo).
4. Fill the create form:
   - **Name:** `maintenanceos-sandbox-test-call` (this becomes `https://maintenanceos-sandbox-test-call.onrender.com`)
   - **Language / Runtime:** **Docker** (not Node native — native `npm install` would pull the whole marketing site)
   - **Branch:** `main`
   - **Region:** nearest to the DigitalOcean staging app is fine (Frankfurt is reasonable for UK)
   - **Root directory:** leave empty (repo root)
   - **Dockerfile path:** `packages/sandbox-test-call/Dockerfile`
   - **Docker build context:** repo root `.` (default). The Dockerfile `COPY`s `packages/sandbox-test-call/…` from the repo root. Do not set context to `src/` (that is the Next app).
   - **Instance type:** click **Free** (512 MB / 0.1 CPU). Do **not** click Starter or any paid size.
5. **Advanced**:
   - **Health Check Path:** `/health`
   - Environment variables (no secrets):

     | Key | Value |
     | --- | --- |
     | `SANDBOX_TEST_CALL_HOST` | `0.0.0.0` |
     | `SANDBOX_TEST_CALL_ENABLED` | `false` for the first deploy; `true` only when you intend scripted sessions |

   - Do **not** attach a disk, start command override, or secret file.
   - Do **not** set Twilio / live-media env. WebRTC stays `not_configured`.
6. Click **Create Web Service**. Wait until the deploy is live and `/health` returns 200.
7. Copy the public URL (service page header, `https://<name>.onrender.com`). The client prefix is:

   `https://<name>.onrender.com/v1/sandbox`

8. When scripted sessions should actually run: service **Environment** → **Add Environment Variable** → `SANDBOX_TEST_CALL_ENABLED` = `true` → **Save Changes** (redeploy). Confirm `GET /health` has `"sandboxEnabled": true`. Confirm `"liveCall": false`.

If the UI asks to upgrade the workspace or pick a paid instance, **stop**. Do not create this service on Starter.

## B. Blueprint (optional)

After this file is on `main`:

1. **New +** → **Blueprint**.
2. Select `chapelgate/maintenanceos-website`.
3. Confirm service names `maintenanceos-onboarding-scan`, `maintenanceos-sandbox-test-call`, optional `maintenanceos-calendar-adapters`, and `maintenanceos-customer-dashboard`, and that every instance plan is **Free**. Dashboard clicks: `docs/DASHBOARD_DEPLOY.md`.
4. Apply. Then still set `SANDBOX_TEST_CALL_ENABLED=true` in the dashboard when you want scripted sessions (Blueprint keeps it `false`).

`buildFilter` skips sandbox deploys when only marketing `src/` / copy changes.

If scan already exists from a previous Blueprint apply, add only the new services — do not recreate or edit frozen voice apps.

## CORS (seahorse-app / chapelgate)

`/create` is a browser `POST`/`GET` from the **static site origin** to this companion (cross-origin). The server already answers `OPTIONS` 204 and allows `GET, POST, OPTIONS` + `Content-Type, Accept` ([contract](SANDBOX_TEST_CALL_CONTRACT.md)).

| `SANDBOX_TEST_CALL_CORS_ORIGIN` | Effect |
| --- | --- |
| unset (recommended for staging) | Echo the request `Origin`, else `*`. Works for DigitalOcean staging `https://seahorse-app-4oasq.ondigitalocean.app` **and** a later chapelgate custom domain without a rebuild of *this* service. |
| one exact origin, no trailing slash | Lock to that origin only. Example: `https://seahorse-app-4oasq.ondigitalocean.app`. A second origin (chapelgate production/staging) would fail CORS until you change this var. |

The process supports **one** configured origin string (not a comma list). If both seahorse-app and a chapelgate origin must call sandbox while locked down, leave the var **unset**.

No cookies; `Access-Control-Allow-Credentials` is not used.

## Point DigitalOcean staging `/create` at it

Static export inlines `NEXT_PUBLIC_*` at `npm run build`. Changing the App Platform env **without a rebuild** leaves `/create` on the old (empty) endpoint / flag, so the panel keeps saying **Sandbox test call — under testing / coming**.

1. Confirm Render `GET https://<name>.onrender.com/health` is 200 and, when you want scripted sessions, `"sandboxEnabled": true` and `"liveCall": false`.
2. DigitalOcean Control Panel → **Apps** → the maintenanceos-website static app (`seahorse-app-4oasq` today).
3. **Settings** → **App-Level Environment Variables** → **Edit**.
4. Add (do not encrypt — these values are public in the JS bundle):

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` | `true` |
   | `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT` | `https://<name>.onrender.com/v1/sandbox` |

   Names are exactly those in `src/config/site.ts`. Scope must include **build time**. App-level variables are visible at build and runtime.
5. **Save**. If a deployment does not start: **Overview** → **Create Deployment** / **Force Rebuild and Deploy** (wording varies). A runtime-only restart is **not** enough.
6. After the deploy, open staging `/create/`. The panel should say **Sandbox test call** is available for a **scripted** demo only. Create a session, then start a scripted test. WebRTC / live media must show honest `not_configured` / `live_call_forbidden` — **must not** invent a successful live call.

Leave `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT` empty in git (`.env.example`). Never commit Render URLs as required defaults.

Do **not** copy `.env.example.fonio-local` onto App Platform.

Turning the companion flag off does not require a DigitalOcean rebuild; turning **on** the Next public flag/endpoint **does**.

Staging order with scan / calendar / dashboard (exact `NEXT_PUBLIC_*`, rebuild, cold-start wake): [`STAGING_COMPANIONS.md`](STAGING_COMPANIONS.md).

## Claims-safe flags

This is not a live receptionist, not a phone number, and not Fonio-parity voice.

- `ok: true` is only a **scripted** demo (`scripted_demo_complete`).
- Never display “call connected” from this companion.
- Ignore any payload with `liveCall: true` or a `liveNumber` (the server does not emit those).
- Frozen live voice (`maintenanceos-redteam`) stays untouched.
- In-memory sessions vanish after free-tier sleep. Wake `/health`, then create a **new** session.

Keep `SANDBOX_TEST_CALL_ENABLED` **false** until you intentionally want staging `/create` to create scripted sessions.

## Local check of the image (optional)

From the website repo root (Docker required):

```bash
docker build -f packages/sandbox-test-call/Dockerfile -t mos-sandbox-test-call .
docker run --rm -p 8790:8790 -e PORT=8790 -e SANDBOX_TEST_CALL_ENABLED=true mos-sandbox-test-call
# other terminal:
curl -s http://127.0.0.1:8790/health
```

Expect `"service":"maintenanceos-sandbox-test-call"`, `"sandboxEnabled":true`, `"liveCall":false` when the flag is on.

## Verify after deploy

```bash
curl -sS https://<name>.onrender.com/health

curl -sS -X POST https://<name>.onrender.com/v1/sandbox/sessions \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://seahorse-app-4oasq.ondigitalocean.app' \
  -d '{"businessName":"Acme Plumbing","greeting":"Warm homes"}'

# After a 200, copy data.id into the next two calls:
curl -sS -X POST https://<name>.onrender.com/v1/sandbox/sessions/<id>/test-call \
  -H 'Content-Type: application/json' \
  -d '{"mode":"scripted"}'

curl -sS -X POST https://<name>.onrender.com/v1/sandbox/sessions/<id>/test-call \
  -H 'Content-Type: application/json' \
  -d '{"mode":"webrtc"}'
```

With the flag off: HTTP 503 `sandbox_disabled`. With the flag on: scripted mode is 200 `scripted_demo_complete` (`liveCall: false`); `webrtc` is 503 `not_configured` (`liveCall: false`). **No invented live call.**

Cold start: if the first curl hangs or 502s, `GET /health` until 200, then retry. Do not treat a timeout as a connected call.

---

## Optional: mock calendar-adapters on the same free blueprint

Same pattern, **separate** service. Not voice. Not scan. Mock provider only on this hosted path — do not put Google/Microsoft credentials in Render env. Google OAuth start/callback (`/oauth/google/start`, `/oauth/google/callback`) is a **local loopback scaffold** (`packages/calendar-adapters/README.md`). Do not register a Render callback URI or claim Google Calendar is live on staging.

**Code:** `packages/calendar-adapters` (`npm run calendar-adapters`)  
**Contract:** [`CALENDAR_ADAPTERS_CONTRACT.md`](CALENDAR_ADAPTERS_CONTRACT.md)  
**Public env names** (verified in `src/config/site.ts`): `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED`, `NEXT_PUBLIC_CALENDAR_ENDPOINT`

| Item | Value |
| --- | --- |
| Service name | `maintenanceos-calendar-adapters` |
| Dockerfile | `packages/calendar-adapters/Dockerfile` |
| Health | `GET /health` → `service: "maintenanceos-calendar-adapters"`, `telephony: false` |
| Slots / book | `POST /v1/calendar/slots`, `/v1/calendar/bookings` |
| Local port | `8789` (`CALENDAR_ADAPTERS_PORT`, else `PORT`) |
| Hosted listen | `CALENDAR_ADAPTERS_HOST=0.0.0.0` + platform `PORT` |
| Flags (first deploy) | `CALENDAR_ADAPTERS_ENABLED=false`, `CALENDAR_ADAPTER_PROVIDER=mock` |

Dashboard create form (Free click required):

- **Name:** `maintenanceos-calendar-adapters`
- **Runtime:** Docker
- **Dockerfile path:** `packages/calendar-adapters/Dockerfile`
- **Docker build context:** `.`
- **Instance type:** click **Free**
- **Health Check Path:** `/health`
- Env: `CALENDAR_ADAPTERS_HOST=0.0.0.0`, `CALENDAR_ADAPTERS_ENABLED=false`, `CALENDAR_ADAPTER_PROVIDER=mock`
- Leave `CALENDAR_ADAPTERS_CORS_ORIGIN` unset to echo Origin (same seahorse-app / chapelgate note as sandbox)

Enable later: `CALENDAR_ADAPTERS_ENABLED=true`. Confirm `/health` has `"adaptersEnabled": true` and `"provider":"mock"`.

DigitalOcean (rebuild required):

```
NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED=true
NEXT_PUBLIC_CALENDAR_ENDPOINT=https://maintenanceos-calendar-adapters.onrender.com/v1/calendar
```

Mock bookings are in-memory. After free-tier sleep they are gone — list slots again; do not invent a confirmed booking. `/create` must not claim a live phone booking. Google/Microsoft stay `not_configured` unless an operator later adds secrets **out of git** — this runbook does not.

Local image check:

```bash
docker build -f packages/calendar-adapters/Dockerfile -t mos-calendar-adapters .
docker run --rm -p 8789:8789 -e PORT=8789 -e CALENDAR_ADAPTERS_ENABLED=true mos-calendar-adapters
curl -s http://127.0.0.1:8789/health
```
