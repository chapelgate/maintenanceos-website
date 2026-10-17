# Piper neural voice on droplet 606110383

This container is separate from the scanner. Do not rebuild, restart, or edit the scanner container. Add only the route in `caddy-route.caddy` to the existing Caddy site. Leave the scanner reverse proxy where it is.

The speaking screen says Jenny (Dioco). That name is the attribution the voice dataset requires.

Do this only after the Piper pull request is on `main`. Stop at the first failed step and follow Rollback. Do not open the public route before the local health check passes.

## Deploy checklist

1. On droplet 606110383, check out the merged `main` commit under `/opt/mos/maintenanceos-website`. Confirm `deploy/piper-tts/SHA256SUMS` is present. Do not restart the scanner.

2. Create the secret file before the container starts. It is the only place the droplet stores the secret. Mode `0600`, owner root, path `/etc/mos/piper.env`. The file contains one line, the name `PIPER_TTS_SECRET`, an equals sign, and a newly generated value. Generate that value on the droplet. Do not invent it in git, the pull request, a log, or a chat. Do not commit the file.

3. Build and start the container from `deploy/piper-tts`:

   ```bash
   cd /opt/mos/maintenanceos-website/deploy/piper-tts
   docker compose up -d --build
   ```

   The image downloads the pinned Piper binary and the Jenny (Dioco) model, then checks `SHA256SUMS`. A checksum failure must fail the build. Leave Caddy unchanged while this runs. The published port is `127.0.0.1:8790` only. Limits are 512 MB and 1 CPU.

4. Health gate, still before any Caddy edit. Both commands must pass:

   ```bash
   curl --fail --silent --show-error http://127.0.0.1:8790/health
   curl --silent --show-error --output /dev/null --write-out "%{http_code}\n" \
     -X POST http://127.0.0.1:8790/v1/voice/piper \
     -H "content-type: application/json" \
     -d '{"text":"Health check."}'
   ```

   Health must be HTTP 200 and `{"ok":true,"engine":"piper","voice":"jenny_dioco"}`. The post without a bearer token must print `401`. If either check fails, roll back and do not edit Caddy.

5. Add the one route. Insert the contents of `caddy-route.caddy` as the first `handle` inside the existing site block of `/etc/caddy/Caddyfile`:

   ```
   handle /v1/voice/piper* {
     reverse_proxy 127.0.0.1:8790
   }
   ```

   Leave the scanner `reverse_proxy 127.0.0.1:8788` where it is. Then:

   ```bash
   sudo caddy validate --config /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   curl --fail --silent --show-error http://127.0.0.1:8790/health
   ```

   If validate fails, or the health check fails after reload, remove only that `handle` block, validate, reload, and continue with Rollback. Do not change any other Caddy line.

6. Set the two function env vars on the DigitalOcean App Platform component that builds `packages/onboarding-ingest`. `project.yml` already declares both names and substitutes them when the function is built. Both must be `RUN_AND_BUILD_TIME`. A runtime-only value does not reach the built function.

   - `PIPER_TTS_URL` is `https://178-128-171-45.sslip.io/v1/voice/piper`. Mark it as a plain value, not a secret.
   - `PIPER_TTS_SECRET` is the same value as in `/etc/mos/piper.env`. Mark it as a secret. Copy it from that file into the component. Do not put it in the URL, a log, or the repository.

   Redeploy the website component so the voice function is rebuilt. The static site and the voice function both need this merged commit. The scanner container does not.

7. Confirm the public path, then one spoken line. Health is open. Speech is not.

   ```bash
   curl --fail --silent --show-error https://178-128-171-45.sslip.io/v1/voice/piper/health
   curl --silent --show-error --output /dev/null --write-out "%{http_code}\n" \
     -X POST https://178-128-171-45.sslip.io/v1/voice/piper \
     -H "content-type: application/json" \
     -d '{"text":"Health check."}'
   ```

   The health body is the same JSON as step 4. The post without a bearer token must be `401`. Then `POST /api/website/voice` with a short text. Expect HTTP 200, `content-type: audio/wav`, and `X-Voice-Engine: piper` while Gemini is out of quota. The page label is `Neural voice (Jenny Dioco)`.

Speech times out at 8 seconds. Text longer than 400 characters is refused. Repeated text is served from `/var/cache/piper`, capped at 200 files.

## Rollback

Roll back if step 4 or step 5 fails, if a speech request without a token is anything other than 401, or if the function returns 5xx.

1. Delete only the `handle /v1/voice/piper*` block from `/etc/caddy/Caddyfile`. Do not change the scanner proxy. `sudo caddy validate --config /etc/caddy/Caddyfile` and `sudo systemctl reload caddy`.
2. `docker compose down` in `/opt/mos/maintenanceos-website/deploy/piper-tts`.
3. Clear `PIPER_TTS_URL` and `PIPER_TTS_SECRET` on the website component and redeploy the voice function. Speech then uses Gemini, and a Gemini failure uses the browser voice.

The scanner container stays running through every step.
