# Deploy the customer-dashboard companion (Render free)

**Status:** operator runbook — $0 staging companion  
**Code:** `packages/customer-dashboard` (`npm run customer-dashboard` → `node --experimental-strip-types packages/customer-dashboard/src/server.ts`)  
**Contract:** [`CUSTOMER_DASHBOARD_CONTRACT.md`](CUSTOMER_DASHBOARD_CONTRACT.md)  
**Public env names** (verified in `src/config/site.ts`): `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED`, `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT`  
**Do not:** attach this to DigitalOcean static hosting, add a Next.js API route, or edit frozen live telephony (`maintenanceos-redteam` / production voice on Render).

The marketing site stays `output: 'export'`. `/dashboard` only talks to the companion when `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` is `true`/`1` **and** `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT` is an absolute `https:` URL baked in at **Next build time**. This companion is a **separate** Node process.

Scan remains `docs/ONBOARDING_SCAN_DEPLOY.md`. Sandbox / mock calendar remain `docs/SANDBOX_DEPLOY.md`. Do not reuse those services for the dashboard.

## What you get

| Item | Value (from source, not assumed) |
| --- | --- |
| Health | `GET /health` → 200 `{ ok, service: "maintenanceos-customer-dashboard", dashboardEnabled, catalogKind, telephony: false, sessionsPath }` even when the flag is off |
| List sessions | `GET /v1/dashboard/sessions` |
| Session + transcript | `GET /v1/dashboard/sessions/{id}` — unknown id → `404 session_not_found` (nothing invented) |
| Bookings stub | `GET /v1/dashboard/bookings` |
| Local defaults | host `127.0.0.1`, port `8791` (`CUSTOMER_DASHBOARD_HOST` / `CUSTOMER_DASHBOARD_PORT`) |
| Hosted listen | `CUSTOMER_DASHBOARD_HOST=0.0.0.0` and Render’s injected `PORT` (the process also reads `PORT` if `CUSTOMER_DASHBOARD_PORT` is unset) |
| Master switch | `CUSTOMER_DASHBOARD_ENABLED` — not `true`/`1` → `503 dashboard_disabled`, no list/detail |
| Catalogue | `CUSTOMER_DASHBOARD_DEMO_DATA` omit/`true` → labelled **SAMPLE / DEMO** rows; `false`/`0` → empty arrays (no invented customers) |

Every non-empty row is labelled **SAMPLE** / **DEMO**. This is not production analytics, not live call history, and not a live customer portal. Do not display these rows as live metrics.

The SAMPLE catalogue is compiled into the process. A sleep or restart does not invent new customers; when demo data is on, the same labelled rows return after wake.

## $0 host

Chapelgate already runs product/voice on Render. Create a **new** free web service from **this** repo. Do not open or change `maintenanceos-redteam-v2` (or any live voice service). Do not attach this process to `maintenanceos-onboarding-scan`, `maintenanceos-sandbox-test-call`, or `maintenanceos-calendar-adapters`.

`render.yaml` sets `plan: free` on every companion. Render’s Blueprint default is **Starter** (paid) if `plan` is omitted — this file does not omit it.

Free web services sleep after **15 minutes** idle. `/dashboard` may then fail the companion GET. Wake with `GET /health` (wait for HTTP 200) and retry. An existing $0 uptime ping to `/health` (not GitHub Actions cron) can prevent spin-down.

Do **not** add a payment method or raise a spend limit to keep this process up.

## A. Dashboard clicks (authoritative for Free)

Render still requires an explicit **Free** click in the UI even when a Blueprint exists.

1. Open [Render Dashboard](https://dashboard.render.com). Use the Chapelgate workspace that already hosts other MOS services.
2. Top right: **New +** → **Web Service**.
3. Connect GitHub repo `chapelgate/maintenanceos-website` (not the pilot/redteam repo).
4. Fill the create form:
   - **Name:** `maintenanceos-customer-dashboard` (this becomes `https://maintenanceos-customer-dashboard.onrender.com`)
   - **Language / Runtime:** **Docker** (not Node native — native `npm install` would pull the whole marketing site)
   - **Branch:** `main`
   - **Region:** nearest to the DigitalOcean staging app is fine (Frankfurt is reasonable for UK)
   - **Root directory:** leave empty (repo root)
   - **Dockerfile path:** `packages/customer-dashboard/Dockerfile`
   - **Docker build context:** repo root `.` (default). The Dockerfile `COPY`s `packages/customer-dashboard/…` from the repo root. Do not set context to `src/` (that is the Next app).
   - **Instance type:** click **Free** (512 MB / 0.1 CPU). Do **not** click Starter or any paid size.
5. **Advanced**:
   - **Health Check Path:** `/health`
   - Environment variables (no secrets):

     | Key | Value |
     | --- | --- |
     | `CUSTOMER_DASHBOARD_HOST` | `0.0.0.0` |
     | `CUSTOMER_DASHBOARD_ENABLED` | `false` for the first deploy; `true` only when you intend SAMPLE list/detail |
     | `CUSTOMER_DASHBOARD_DEMO_DATA` | `true` — hosted rows stay SAMPLE / DEMO. Do not present as production analytics. |

   - Do **not** attach a disk, start command override, or secret file.
   - Do **not** set Twilio / live-history env. `telephony` stays `false`.
6. Click **Create Web Service**. Wait until the deploy is live and `/health` returns 200.
7. Copy the public URL (service page header, `https://<name>.onrender.com`). The client prefix is:

   `https://<name>.onrender.com/v1/dashboard`

8. When SAMPLE list/detail should actually run: service **Environment** → **Add Environment Variable** → `CUSTOMER_DASHBOARD_ENABLED` = `true` → **Save Changes** (redeploy). Confirm `GET /health` has `"dashboardEnabled": true`, `"catalogKind": "demo"`, and `"telephony": false`.

If the UI asks to upgrade the workspace or pick a paid instance, **stop**. Do not create this service on Starter.

## B. Blueprint (optional)

After this file is on `main`:

1. **New +** → **Blueprint**.
2. Select `chapelgate/maintenanceos-website`.
3. Confirm service names `maintenanceos-onboarding-scan`, `maintenanceos-sandbox-test-call`, `maintenanceos-calendar-adapters`, and `maintenanceos-customer-dashboard`, and that every instance plan is **Free**.
4. Apply. Then still set `CUSTOMER_DASHBOARD_ENABLED=true` in the dashboard when you want SAMPLE list/detail (Blueprint keeps it `false`). Keep `CUSTOMER_DASHBOARD_DEMO_DATA=true`.

`buildFilter` skips dashboard deploys when only marketing `src/` / copy changes.

If scan / sandbox already exist from a previous Blueprint apply, add only the new service — do not recreate or edit frozen voice apps.

## CORS (seahorse-app / chapelgate)

`/dashboard` is a browser `GET` from the **static site origin** to this companion (cross-origin). The server already answers `OPTIONS` 204 and allows `GET, OPTIONS` + `Content-Type, Accept` ([contract](CUSTOMER_DASHBOARD_CONTRACT.md)).

| `CUSTOMER_DASHBOARD_CORS_ORIGIN` | Effect |
| --- | --- |
| unset (recommended for staging) | Echo the request `Origin`, else `*`. Works for DigitalOcean staging `https://seahorse-app-4oasq.ondigitalocean.app` **and** a later chapelgate custom domain without a rebuild of *this* service. |
| one exact origin, no trailing slash | Lock to that origin only. Example: `https://seahorse-app-4oasq.ondigitalocean.app`. A second origin (chapelgate production/staging) would fail CORS until you change this var. |

The process supports **one** configured origin string (not a comma list). If both seahorse-app and a chapelgate origin must call the dashboard while locked down, leave the var **unset**.

No cookies; `Access-Control-Allow-Credentials` is not used.

## Point DigitalOcean staging `/dashboard` at it

Static export inlines `NEXT_PUBLIC_*` at `npm run build`. Changing the App Platform env **without a rebuild** leaves `/dashboard` on the old (empty) endpoint / flag, so the page keeps saying **Customer dashboard — coming / under testing**.

1. Confirm Render `GET https://<name>.onrender.com/health` is 200 and, when you want SAMPLE list/detail, `"dashboardEnabled": true`, `"catalogKind": "demo"`, `"telephony": false`.
2. DigitalOcean Control Panel → **Apps** → the maintenanceos-website static app (`seahorse-app-4oasq` today).
3. **Settings** → **App-Level Environment Variables** → **Edit**.
4. Add (do not encrypt — these values are public in the JS bundle):

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` | `true` |
   | `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT` | `https://<name>.onrender.com/v1/dashboard` |

   Names are exactly those in `src/config/site.ts`. Scope must include **build time**. App-level variables are visible at build and runtime.
5. **Save**. If a deployment does not start: **Overview** → **Create Deployment** / **Force Rebuild and Deploy** (wording varies). A runtime-only restart is **not** enough.
6. After the deploy, open staging `/dashboard/`. The page should load labelled **SAMPLE / DEMO** history, transcript, and bookings stub. Nav should say **Dashboard** (not **Dashboard (soon)**). **Must not** present these rows as live production analytics. Unknown session ids stay `session_not_found` — **must not** invent a customer.

Leave `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT` empty in git (`.env.example`). Never commit Render URLs as required defaults.

Do **not** copy `.env.example.fonio-local` onto App Platform.

Turning the companion flag off does not require a DigitalOcean rebuild; turning **on** the Next public flag/endpoint **does**.

Staging order with scan / sandbox / calendar (exact `NEXT_PUBLIC_*`, rebuild, cold-start wake): [`STAGING_COMPANIONS.md`](STAGING_COMPANIONS.md).

## Claims-safe flags

This is not a live receptionist, not a phone number, not production analytics, and not Fonio-parity.

- Non-empty rows must keep `kind: "demo"` and `sampleLabel: "SAMPLE"`. The marketing mapper drops rows that omit those.
- Empty store (`CUSTOMER_DASHBOARD_DEMO_DATA=false`) → empty arrays. Do not invent customers.
- Ignore any payload that claims live telephony (`telephony` on `/health` is always `false`).
- Frozen live voice (`maintenanceos-redteam`) stays untouched.
- After free-tier sleep: wake `/health`, then retry. SAMPLE catalogue rows return when demo data is on; they are still demo, not a recovered live history.

Keep `CUSTOMER_DASHBOARD_ENABLED` **false** until you intentionally want staging `/dashboard` to fetch SAMPLE rows.

## Local check of the image (optional)

From the website repo root (Docker required):

```bash
docker build -f packages/customer-dashboard/Dockerfile -t mos-customer-dashboard .
docker run --rm -p 8791:8791 -e PORT=8791 -e CUSTOMER_DASHBOARD_ENABLED=true mos-customer-dashboard
# other terminal:
curl -s http://127.0.0.1:8791/health
```

Expect `"service":"maintenanceos-customer-dashboard"`, `"dashboardEnabled":true`, `"catalogKind":"demo"`, `"telephony":false` when the flag is on.

## Verify after deploy

```bash
curl -sS https://<name>.onrender.com/health

curl -sS https://<name>.onrender.com/v1/dashboard/sessions \
  -H 'Origin: https://seahorse-app-4oasq.ondigitalocean.app'

curl -sS https://<name>.onrender.com/v1/dashboard/sessions/demo_session_1 \
  -H 'Origin: https://seahorse-app-4oasq.ondigitalocean.app'

curl -sS https://<name>.onrender.com/v1/dashboard/bookings \
  -H 'Origin: https://seahorse-app-4oasq.ondigitalocean.app'

curl -sS -o /dev/null -w '%{http_code}\n' \
  https://<name>.onrender.com/v1/dashboard/sessions/nope
```

With the flag off: HTTP 503 `dashboard_disabled`. With the flag on: list/detail/bookings are 200 with **SAMPLE** labels; unknown id is 404 `session_not_found`. **No invented customers. No production analytics claims.**

Cold start: if the first curl hangs or 502s, `GET /health` until 200, then retry. Do not treat a timeout as live history.
