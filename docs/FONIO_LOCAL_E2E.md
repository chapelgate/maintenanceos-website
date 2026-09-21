# Local Fonio e2e stack — website → receptionist loop *shape*

**Status:** local / developer demo only  
**Not:** production Fonio-parity, a live phone number, WebRTC media, or DigitalOcean static hosting.

This runbook wires the **already-landed** flagged companions into `/create` (and optionally `/dashboard`) so a human can walk the claims-safe loop on loopback:

**URL → scan draft → calendar mock → scripted sandbox demo → SAMPLE dashboard**

Flags stay **OFF** in `.env.example` and therefore on App Platform static export unless an operator copies `.env.example.fonio-local` into a local `.env.local`. `output: 'export'` is unchanged. Frozen live telephony is not started and is not called.

Primary runner: `scripts/fonio-local-stack.sh` (plain Node). Compose file: `docker-compose.fonio-local.yml` (named so it is not a default App Platform Docker spec).

## Ports and env names (from source, not assumed)

Verified in package READMEs, `*/src/server.ts` `DEFAULT_PORT`, and `src/config/site.ts`.

| Process | Port | Companion flag (process) | Public Next vars (inlined at `next dev` / `next build`) | Client |
| --- | --- | --- | --- | --- |
| Form stub (optional) | 8787 | — | `NEXT_PUBLIC_FORM_ENDPOINT=http://127.0.0.1:8787/leads` | `src/lib/lead-adapter.ts` |
| Onboarding scan | 8788 | `ONBOARDING_WEB_INGEST=true` | `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=http://127.0.0.1:8788/v1/onboarding/scan` | `src/lib/onboarding-create.ts` |
| Calendar adapters | 8789 | `CALENDAR_ADAPTERS_ENABLED=true` | `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED=true` and `NEXT_PUBLIC_CALENDAR_ENDPOINT=http://127.0.0.1:8789/v1/calendar` | `src/lib/calendar-create.ts` |
| Sandbox test-call | 8790 | `SANDBOX_TEST_CALL_ENABLED=true` | `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED=true` and `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT=http://127.0.0.1:8790/v1/sandbox` | `src/lib/sandbox-test-call.ts` |
| Customer dashboard (optional) | 8791 | `CUSTOMER_DASHBOARD_ENABLED=true` | `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED=true` and `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT=http://127.0.0.1:8791/v1/dashboard` | `src/lib/customer-dashboard.ts` |

Copy-paste file: [`.env.example.fonio-local`](../.env.example.fonio-local).

Contracts: [`ONBOARDING_SCAN_CONTRACT.md`](ONBOARDING_SCAN_CONTRACT.md), [`CALENDAR_ADAPTERS_CONTRACT.md`](CALENDAR_ADAPTERS_CONTRACT.md), [`SANDBOX_TEST_CALL_CONTRACT.md`](SANDBOX_TEST_CALL_CONTRACT.md), [`CUSTOMER_DASHBOARD_CONTRACT.md`](CUSTOMER_DASHBOARD_CONTRACT.md).

`GET /health` returns **200 even when flags are off**. Local e2e is only honest if the companion flag fields are `true` (`ingestEnabled`, `adaptersEnabled`, `sandboxEnabled`, `dashboardEnabled`). Calendar / sandbox / dashboard health also report `telephony: false`. Sandbox health reports `liveCall: false`.

Scan is stateless. Calendar mock bookings and sandbox sessions live **in memory for that process** (until `down`). Dashboard SAMPLE rows are a labelled catalogue, not live history.

## Start the stack

Node 22+ (for `--experimental-strip-types`). From the repo root:

```bash
chmod +x scripts/fonio-local-stack.sh   # once
./scripts/fonio-local-stack.sh up
# or: npm run fonio-local-stack -- up
```

This starts scan **8788**, calendar **8789** (mock provider), sandbox **8790**, and dashboard **8791** (SAMPLE catalogue) on `127.0.0.1`, with companion flags **on**. It does **not** start Next, Twilio, or a browser.

Optional:

```bash
./scripts/fonio-local-stack.sh up --no-dashboard
./scripts/fonio-local-stack.sh up --form-stub
./scripts/fonio-local-stack.sh up --foreground
./scripts/fonio-local-stack.sh status
./scripts/fonio-local-stack.sh logs
./scripts/fonio-local-stack.sh down
```

Logs and PID files: `.data/fonio-local/` (gitignored).

### Docker (optional)

Requires Docker. Not used by DigitalOcean static hosting.

```bash
docker compose -f docker-compose.fonio-local.yml up
# dashboard + form stub are Compose profiles:
docker compose -f docker-compose.fonio-local.yml --profile dashboard --profile form-stub up
# or: ./scripts/fonio-local-stack.sh up --docker
```

Compose publishes `127.0.0.1:<port>` and binds `0.0.0.0` *inside* the container so mapping works. Default services: scan + calendar + sandbox. Dashboard is `--profile dashboard`.

## Point `/create` (+ `/dashboard`) at it

Static export inlines `NEXT_PUBLIC_*` when Next **starts**. Restart `next dev` after changing `.env.local`.

```bash
cp .env.example.fonio-local .env.local
npm run dev
```

Open:

- http://localhost:3000/create/
- http://localhost:3000/dashboard/  (only if dashboard companion + public flag are on)

If you used `--no-dashboard`, leave `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` false / unset so `/dashboard` stays on the honest **coming / under testing** copy instead of fetching a down port.

Do **not** copy `.env.example.fonio-local` into App Platform. Production/static `.env.example` keeps endpoints empty and flags `false`.

## Expected honest behaviours

These are what the existing UI already does. The stack does not invent a successful live call.

### `/create` — website crawl

| Setup | What you should see |
| --- | --- |
| Endpoint **empty** (default DO / `.env.example`) | After URL + email, step 2: **Website crawl is queued for early access.** Hostname may seed `businessName` only. No invented hours/services/FAQs. |
| This local stack (endpoint set, ingest on) | Step 2: **Asking the configured scan service…** then either mapped fields, **scan responded but returned no extractable fields**, or a fetch/SSRF failure. Missing keys stay empty. Step 3: filled fields may show a `fieldMeta` source + confidence hint; empty fields stay empty. |
| `http://localhost/…` or a private IP | Scan **rejects** (SSRF). The form must not fill a fake draft. |

Use a public `https://` site (for example `https://example.com/`). Extract is best-effort untrusted page data, not a live receptionist.

### `/create` — calendar

| Setup | What you should see |
| --- | --- |
| Public flag **off** (default) | **Calendar connect — coming / under testing.** No booked confirmation. |
| Flag on + this stack (`CALENDAR_ADAPTER_PROVIDER=mock`) | **Calendar connect — local adapter testing.** Weekday 09:00–17:00 Europe/London gaps from the mock adapter. Reserving a slot tests the adapter. **Not** a phone booking and **not** Google/Microsoft unless you separately configure OAuth on the companion (never commit secrets). Google start/callback is loopback `http://127.0.0.1:8789/oauth/google/start` — do not claim Google is live on staging. |
| Flag on, endpoint empty | In-browser mock, labelled as local testing only. |

### `/create` — sandbox test call

| Setup | What you should see |
| --- | --- |
| Public flag **off** (default) | **Sandbox test call — under testing / coming.** No live number. |
| Flag on + this stack | **Sandbox test call — local scripted demo.** Create session, then **Start scripted sandbox test**. Status `scripted_demo_complete`. Missing draft fields are stated as missing. |
| WebRTC / live media | Honest **`not_configured`** / **`live_call_forbidden`**. The UI must not show a successful live customer call. Frozen production voice is untouched. Do not claim Fonio voice quality. |

### `/dashboard` (optional)

| Setup | What you should see |
| --- | --- |
| Public flag **off** (default) | **Customer dashboard — coming / under testing.** Nav: **Dashboard (soon)**. |
| Flag on + this stack (`CUSTOMER_DASHBOARD_DEMO_DATA=true`) | **SAMPLE / DEMO — not live production metrics.** Labelled mock history, transcript, bookings stub. Not live telephony history. |
| Empty store (`CUSTOMER_DASHBOARD_DEMO_DATA=false`) | Empty lists. **No invented customers.** |

### Submit early access

The create journey still queues a `create_receptionist` lead (client stub unless you started `--form-stub`). Thank-you copy **must not** say email was sent or that a live number was provisioned.

## Smoke

```bash
npm run fonio-local-smoke
npm run fonio-local-smoke -- --no-dashboard
npm run fonio-local-smoke -- --form-stub
```

Each line is `PASS`, `FAIL`, or `SKIP`. Required companions with flags still off fail even if `/health` is 200. This is **not** a carrier-call test.

## What this still is not

- Not production Fonio-parity (see [`docs/competitive/fonio-parity-matrix.md`](competitive/fonio-parity-matrix.md)).
- Not a sandbox tenant / promote path.
- Not live WebRTC or Twilio; not a change to the frozen live voice path.
- Not customer-GA calendar OAuth or voice booking confirmation.
- Not a live customer portal or analytics.
- Not enabled on DigitalOcean static hosting by default. Staging HTTPS scan is a **separate** Render free service: [`ONBOARDING_SCAN_DEPLOY.md`](ONBOARDING_SCAN_DEPLOY.md). Staging HTTPS sandbox (and optional mock calendar) is a **separate** Render free service: [`SANDBOX_DEPLOY.md`](SANDBOX_DEPLOY.md). Staging HTTPS dashboard is a **separate** Render free service: [`DASHBOARD_DEPLOY.md`](DASHBOARD_DEPLOY.md) (SAMPLE / DEMO only). One operator checklist for DigitalOcean env + rebuild + wake order: [`STAGING_COMPANIONS.md`](STAGING_COMPANIONS.md).

Spend: none. No new paid infra, no scheduled GitHub Actions, no cron.
