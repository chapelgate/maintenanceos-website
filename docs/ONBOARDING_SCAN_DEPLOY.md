# Deploy the onboarding scan companion (DigitalOcean droplet)

**Status:** operator runbook — DigitalOcean droplet companion  
**Code:** `packages/onboarding-ingest` (`npm run onboarding-scan` → `node --experimental-strip-types packages/onboarding-ingest/src/server.ts`)  
**Contract:** [`ONBOARDING_SCAN_CONTRACT.md`](ONBOARDING_SCAN_CONTRACT.md)  
**Do not:** attach this to DigitalOcean App Platform **static** hosting, add a Next.js API route, apply `render.yaml`, open Render for a new companion, or edit frozen live telephony (`maintenanceos-redteam` / production voice).

The marketing site stays `output: 'export'` on DigitalOcean App Platform **static** (free). `/create` only crawls when `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` is an absolute `https:` URL baked in at **Next build time**. This companion is a **separate** Node process.

**Owner decision: do not use Render.** `render.yaml` is **legacy / do not use**. There is no documented App Platform **web service** spec for companions — do not convert the static marketing app into one.

This file does **not** create a droplet, DNS record, or certificate. Do not create paid cloud resources from an agent.

## What you get

| Item | Value (from source, not assumed) |
| --- | --- |
| Health | `GET /health` → 200 `{ ok, service: "maintenanceos-onboarding-scan", ingestEnabled, sandboxCall: false, scanPath }` even when crawl is off |
| Scan | `POST /v1/onboarding/scan` with JSON `{ "url": "https://…" }` |
| Local defaults | host `127.0.0.1`, port `8788` (`ONBOARDING_SCAN_HOST` / `ONBOARDING_SCAN_PORT`) |
| Hosted listen | `ONBOARDING_SCAN_HOST=0.0.0.0` inside Docker; `127.0.0.1` when a reverse proxy is on the same droplet. The process reads `PORT` if `ONBOARDING_SCAN_PORT` is unset. |
| Master switch | `ONBOARDING_WEB_INGEST` — not `true`/`1` → `503 scan_disabled`, no fetch |

## Host

Use a **small Ubuntu droplet** (22.04 or 24.04) that the operator already has or creates in the DigitalOcean Control Panel. A 1 GB / 1 vCPU droplet is enough for this Node process plus a reverse proxy.

Do **not**:

- Point DigitalOcean App Platform static at this process, `packages/onboarding-ingest/Dockerfile`, or `docker-compose.fonio-local.yml`
- Apply `render.yaml` or create a Render web service
- Attach this process to frozen voice (`maintenanceos-redteam-v2`)
- Commit secrets, API tokens, or a live phone number

Open firewall ports **22 / 80 / 443** only. Keep the Node listen port off the public internet (bind `127.0.0.1:8788` and reverse-proxy).

## A. Docker on the droplet (preferred)

The existing companion image is the same process as `npm run onboarding-scan`. Build from the **website repo root**.

```bash
# on the droplet, as a sudo-capable user
sudo apt-get update
sudo apt-get install -y git docker.io
sudo usermod -aG docker "$USER"   # re-login after this

sudo mkdir -p /opt/mos
sudo chown "$USER":"$USER" /opt/mos
cd /opt/mos
git clone https://github.com/chapelgate/maintenanceos-website.git
cd maintenanceos-website
git checkout main

docker build -f packages/onboarding-ingest/Dockerfile -t mos-onboarding-scan .
docker run -d --name mos-onboarding-scan --restart unless-stopped \
  -p 127.0.0.1:8788:8788 \
  -e PORT=8788 \
  -e ONBOARDING_SCAN_HOST=0.0.0.0 \
  -e ONBOARDING_WEB_INGEST=false \
  mos-onboarding-scan
```

Leave `ONBOARDING_SCAN_CORS_ORIGIN` **unset** so seahorse-app and a later chapelgate origin both work (see CORS below).

Confirm the process (still ingest-off):

```bash
curl -sS http://127.0.0.1:8788/health
```

Expect `"service":"maintenanceos-onboarding-scan"` and `"ingestEnabled":false`.

When crawl should actually run:

```bash
docker stop mos-onboarding-scan && docker rm mos-onboarding-scan
docker run -d --name mos-onboarding-scan --restart unless-stopped \
  -p 127.0.0.1:8788:8788 \
  -e PORT=8788 \
  -e ONBOARDING_SCAN_HOST=0.0.0.0 \
  -e ONBOARDING_WEB_INGEST=true \
  mos-onboarding-scan
curl -sS http://127.0.0.1:8788/health   # "ingestEnabled": true
```

Do not put secrets in the `docker run` line. There are no companion secrets.

## B. systemd + Node 22 (no Docker)

Use this only if Docker is unavailable. Node **22+** is required (`--experimental-strip-types`). Ubuntu 24.04 `apt` Node is often too old — install Node 22 from [NodeSource](https://github.com/nodesource/distributions) or use section A.

```bash
sudo mkdir -p /opt/mos
sudo chown "$USER":"$USER" /opt/mos
cd /opt/mos
git clone https://github.com/chapelgate/maintenanceos-website.git
cd maintenanceos-website
```

`/etc/systemd/system/mos-onboarding-scan.service`:

```ini
[Unit]
Description=MaintenanceOS onboarding-scan companion
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/mos/maintenanceos-website
Environment=NODE_ENV=production
Environment=ONBOARDING_SCAN_HOST=127.0.0.1
Environment=PORT=8788
Environment=ONBOARDING_WEB_INGEST=false
ExecStart=/usr/bin/node --experimental-strip-types packages/onboarding-ingest/src/server.ts
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mos-onboarding-scan
curl -sS http://127.0.0.1:8788/health
```

To enable crawl: set `ONBOARDING_WEB_INGEST=true` in the unit, then `sudo systemctl daemon-reload && sudo systemctl restart mos-onboarding-scan`. Confirm `GET /health` has `"ingestEnabled": true`.

## Reverse proxy / HTTPS

Staging `/create` is served on `https://seahorse-app-4oasq.ondigitalocean.app`. The browser will only `POST` an `https:` companion URL (mixed content is blocked). Put TLS in front of `127.0.0.1:8788`.

Replace `<droplet-host>` with the droplet’s DNS name (operator-created). Do not commit that hostname as a required default in git.

### Caddy (fewest clicks)

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
# install Caddy from the official apt repo, then:
```

`/etc/caddy/Caddyfile`:

```
<droplet-host> {
  reverse_proxy 127.0.0.1:8788
}
```

```bash
sudo systemctl enable --now caddy
curl -sS https://<droplet-host>/health
```

### nginx + Let’s Encrypt

```nginx
server {
  listen 80;
  server_name <droplet-host>;
  location / {
    proxy_pass http://127.0.0.1:8788;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Then `certbot --nginx -d <droplet-host>`. Health and scan paths stay `/health` and `/v1/onboarding/scan` on the public host (no extra prefix).

The public scan URL is:

`https://<droplet-host>/v1/onboarding/scan`

## CORS (seahorse-app / chapelgate)

`/create` is a browser `POST` from the **static site origin** to this companion (cross-origin). The server already answers `OPTIONS` 204 and allows `POST, OPTIONS` + `Content-Type, Accept` ([contract](ONBOARDING_SCAN_CONTRACT.md)).

| `ONBOARDING_SCAN_CORS_ORIGIN` | Effect |
| --- | --- |
| unset (recommended for staging) | Echo the request `Origin`, else `*`. Works for DigitalOcean staging `https://seahorse-app-4oasq.ondigitalocean.app` **and** a later chapelgate custom domain without a rebuild of *this* process. |
| one exact origin, no trailing slash | Lock to that origin only. Example: `https://seahorse-app-4oasq.ondigitalocean.app`. A second origin (chapelgate production/staging) would fail CORS until you change this var. |

The process supports **one** configured origin string (not a comma list). If both seahorse-app and a chapelgate origin must call scan while locked down, leave the var **unset**.

No cookies; `Access-Control-Allow-Credentials` is not used.

## Point DigitalOcean staging `/create` at it

Static export inlines `NEXT_PUBLIC_*` at `npm run build`. Changing the App Platform env **without a rebuild** leaves `/create` on the old (empty) endpoint, so the client keeps queuing crawl honestly.

1. Confirm droplet `GET https://<droplet-host>/health` is 200 and, when you want live extract, `"ingestEnabled": true`.
2. DigitalOcean Control Panel → **Apps** → the maintenanceos-website **static** app (`seahorse-app-4oasq` today).
3. **Settings** → **App-Level Environment Variables** → **Edit**.
4. Add (do not encrypt — this URL is public in the JS bundle):

   `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=https://<droplet-host>/v1/onboarding/scan`

   Scope must include **build time**. App-level variables are visible at build and runtime.
5. **Save**. If a deployment does not start: **Overview** → **Create Deployment** / **Force Rebuild and Deploy** (wording varies). A runtime-only restart is **not** enough.
6. After the deploy, open staging `/create/`, enter a **public HTTPS** business URL, continue. The browser should `POST` the droplet URL. Empty extract fields mean “not found”, not invented copy.

Leave `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` empty in git (`.env.example`). Never commit droplet hostnames or IPs as required defaults.

Do **not** copy `.env.example.fonio-local` onto App Platform.

Staging order with the other companions (exact `NEXT_PUBLIC_*`, rebuild, health check): [`STAGING_COMPANIONS.md`](STAGING_COMPANIONS.md). Website readiness / owner blocker: [`FONIO_WEBSITE_READINESS.md`](FONIO_WEBSITE_READINESS.md).

## SSRF and claims-safe flags

Enabling `ONBOARDING_WEB_INGEST=true` on a public host means **anyone who can hit `POST /v1/onboarding/scan` can ask this process to fetch a public HTTPS URL** (SSRF-guarded). Threat model: [`threat-model-onboarding-ingest.md`](security/threat-model-onboarding-ingest.md).

Guards already in process (unchanged):

- HTTPS only; userinfo, localhost, private/reserved IPs, metadata hosts denied
- DNS + redirect re-check on every hop
- page/byte/time caps; robots.txt honoured
- 20 POSTs / minute / connected IP (behind a reverse proxy this is often the proxy — conservative, not per-browser)
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
curl -sS https://<droplet-host>/health
curl -sS -X POST https://<droplet-host>/v1/onboarding/scan \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://seahorse-app-4oasq.ondigitalocean.app' \
  -d '{"url":"https://example.com/"}'
```

With ingest off: HTTP 503 `scan_disabled`. With ingest on: 200 draft or a typed error — **no invented `draft`**.

## Extract limits

The companion **copies** public HTML (JSON-LD, meta, labelled blocks, conservative hours/nav/FAQ/`tel`/`mailto` patterns). It does not run page JavaScript and does not guess missing hours or services. Optional `fieldMeta` is provenance for review; `/create` shows source + confidence on filled fields only and still maps only `businessName`, `greeting`, `hours`, `services`, `faqs`. Details: `packages/onboarding-ingest/README.md`.
