# Deploy the onboarding scan companion (Render free)

**Status:** operator runbook — $0 staging companion  
**Code:** `packages/onboarding-ingest` (`npm run onboarding-scan` → `node --experimental-strip-types packages/onboarding-ingest/src/server.ts`)  
**Contract:** [`ONBOARDING_SCAN_CONTRACT.md`](ONBOARDING_SCAN_CONTRACT.md)  
**Do not:** attach this to DigitalOcean static hosting, add a Next.js API route, or edit frozen live telephony (`maintenanceos-redteam` / production voice on Render).

The marketing site stays `output: 'export'`. `/create` only crawls when `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` is an absolute `https:` URL baked in at **Next build time**. This companion is a **separate** Node process.

## What you get

| Item | Value (from source, not assumed) |
| --- | --- |
| Health | `GET /health` → 200 `{ ok, service: "maintenanceos-onboarding-scan", ingestEnabled, sandboxCall: false, scanPath }` even when crawl is off |
| Scan | `POST /v1/onboarding/scan` with JSON `{ "url": "https://…" }` |
| Local defaults | host `127.0.0.1`, port `8788` (`ONBOARDING_SCAN_HOST` / `ONBOARDING_SCAN_PORT`) |
| Hosted listen | `ONBOARDING_SCAN_HOST=0.0.0.0` and Render’s injected `PORT` (the process also reads `PORT` if `ONBOARDING_SCAN_PORT` is unset) |
| Master switch | `ONBOARDING_WEB_INGEST` — not `true`/`1` → `503 scan_disabled`, no fetch |

## $0 host

Chapelgate already runs product/voice on Render. Create a **new** free web service from **this** repo. Do not open or change `maintenanceos-redteam-v2` (or any live voice service).

`render.yaml` sets `plan: free`. Render’s Blueprint default is **Starter** (paid) if `plan` is omitted — this file does not omit it.

Free web services sleep after **15 minutes** idle. `/create` waits 15 seconds, so a cold POST may return “scan service is unavailable” and **must not invent** draft fields. Wake with `GET /health` (wait for HTTP 200) and retry. An existing $0 uptime ping to `/health` (not GitHub Actions cron) can prevent spin-down.

Do **not** add a payment method or raise a spend limit to keep this process up.

## A. Dashboard clicks (authoritative for Free)

Render still requires an explicit **Free** click in the UI even when a Blueprint exists.

1. Open [Render Dashboard](https://dashboard.render.com). Use the Chapelgate workspace that already hosts other MOS services.
2. Top right: **New +** → **Web Service**.
3. Connect GitHub repo `chapelgate/maintenanceos-website` (not the pilot/redteam repo).
4. Fill the create form:
   - **Name:** `maintenanceos-onboarding-scan` (this becomes `https://maintenanceos-onboarding-scan.onrender.com`)
   - **Language / Runtime:** **Docker** (not Node native — native `npm install` would pull the whole marketing site)
   - **Branch:** `main`
   - **Region:** nearest to the DigitalOcean staging app is fine (Frankfurt is reasonable for UK)
   - **Root directory:** leave empty (repo root)
   - **Dockerfile path:** `packages/onboarding-ingest/Dockerfile`
   - **Docker build context:** repo root `.` (default). The Dockerfile `COPY`s `packages/onboarding-ingest/…` from the repo root. Do not set context to `src/` (that is the Next app).
   - **Instance type:** click **Free** (512 MB / 0.1 CPU). Do **not** click Starter or any paid size.
5. **Advanced**:
   - **Health Check Path:** `/health`
   - Environment variables (no secrets):

     | Key | Value |
     | --- | --- |
     | `ONBOARDING_SCAN_HOST` | `0.0.0.0` |
     | `ONBOARDING_WEB_INGEST` | `false` for the first deploy; `true` only when you intend public HTTPS crawl |

   - Do **not** attach a disk, start command override, or secret file.
6. Click **Create Web Service**. Wait until the deploy is live and `/health` returns 200.
7. Copy the public URL (service page header, `https://<name>.onrender.com`). The scan path is:

   `https://<name>.onrender.com/v1/onboarding/scan`

8. When crawl should actually run: service **Environment** → **Add Environment Variable** → `ONBOARDING_WEB_INGEST` = `true` → **Save Changes** (redeploy). Confirm `GET /health` has `"ingestEnabled": true`.

If the UI asks to upgrade the workspace or pick a paid instance, **stop**. Do not create this service on Starter.

## B. Blueprint (optional)

After this file is on `main`:

1. **New +** → **Blueprint**.
2. Select `chapelgate/maintenanceos-website`.
3. Confirm the service name is `maintenanceos-onboarding-scan` and the instance plan is **Free**.
4. Apply. Then still set `ONBOARDING_WEB_INGEST=true` in the dashboard when you want crawl (Blueprint keeps it `false`).

`buildFilter` skips deploys when only marketing `src/` / copy changes.

## CORS (seahorse-app / chapelgate)

`/create` is a browser `POST` from the **static site origin** to this companion (cross-origin). The server already answers `OPTIONS` 204 and allows `POST, OPTIONS` + `Content-Type, Accept` ([contract](ONBOARDING_SCAN_CONTRACT.md)).

| `ONBOARDING_SCAN_CORS_ORIGIN` | Effect |
| --- | --- |
| unset (recommended for staging) | Echo the request `Origin`, else `*`. Works for DigitalOcean staging `https://seahorse-app-4oasq.ondigitalocean.app` **and** a later chapelgate custom domain without a rebuild of *this* service. |
| one exact origin, no trailing slash | Lock to that origin only. Example: `https://seahorse-app-4oasq.ondigitalocean.app`. A second origin (chapelgate production/staging) would fail CORS until you change this var. |

The process supports **one** configured origin string (not a comma list). If both seahorse-app and a chapelgate origin must call scan while locked down, leave the var **unset**.

No cookies; `Access-Control-Allow-Credentials` is not used.

## Point DigitalOcean staging `/create` at it

Static export inlines `NEXT_PUBLIC_*` at `npm run build`. Changing the App Platform env **without a rebuild** leaves `/create` on the old (empty) endpoint, so the client keeps queuing crawl honestly.

1. Confirm Render `GET https://<name>.onrender.com/health` is 200 and, when you want live extract, `"ingestEnabled": true`.
2. DigitalOcean Control Panel → **Apps** → the maintenanceos-website static app (`seahorse-app-4oasq` today).
3. **Settings** → **App-Level Environment Variables** → **Edit**.
4. Add (do not encrypt — this URL is public in the JS bundle):

   `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=https://<name>.onrender.com/v1/onboarding/scan`

   Scope must include **build time**. App-level variables are visible at build and runtime.
5. **Save**. If a deployment does not start: **Overview** → **Create Deployment** / **Force Rebuild and Deploy** (wording varies). A runtime-only restart is **not** enough.
6. After the deploy, open staging `/create/`, enter a **public HTTPS** business URL, continue. The browser should `POST` the Render URL. Empty extract fields mean “not found”, not invented copy.

Leave `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` empty in git (`.env.example`). Never commit Render URLs as required defaults.

Do **not** copy `.env.example.fonio-local` onto App Platform.

## SSRF and claims-safe flags

Enabling `ONBOARDING_WEB_INGEST=true` on a public host means **anyone who can hit `POST /v1/onboarding/scan` can ask this process to fetch a public HTTPS URL** (SSRF-guarded). Threat model: [`threat-model-onboarding-ingest.md`](security/threat-model-onboarding-ingest.md).

Guards already in process (unchanged):

- HTTPS only; userinfo, localhost, private/reserved IPs, metadata hosts denied
- DNS + redirect re-check on every hop
- page/byte/time caps; robots.txt honoured
- 20 POSTs / minute / connected IP (behind Render this is often the proxy — conservative, not per-browser)
- Extracted strings are **untrusted data**; never telephony; never concatenated into a system prompt

Keep the flag **false** until you intentionally want staging `/create` to crawl. Turning the flag off does not require a DigitalOcean rebuild; turning **on** the Next public endpoint **does**.

This is not a live receptionist, not a phone number, and not Fonio-parity.

## Local check of the image (optional)

From the website repo root (Docker required):

```bash
docker build -f packages/onboarding-ingest/Dockerfile -t mos-onboarding-scan .
docker run --rm -p 8788:8788 -e PORT=8788 -e ONBOARDING_WEB_INGEST=true mos-onboarding-scan
# other terminal:
curl -s http://127.0.0.1:8788/health
```

Expect `"service":"maintenanceos-onboarding-scan"` and `"ingestEnabled":true` when the flag is on.

## Verify after deploy

```bash
curl -sS https://<name>.onrender.com/health
curl -sS -X POST https://<name>.onrender.com/v1/onboarding/scan \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://seahorse-app-4oasq.ondigitalocean.app' \
  -d '{"url":"https://example.com/"}'
```

With ingest off: HTTP 503 `scan_disabled`. With ingest on: 200 draft or a typed error — **no invented `draft`**.
