# Piper neural voice on droplet 606110383

This container is separate from the scanner. Do not rebuild, restart, or edit the scanner container. Add only the route in `caddy-route.caddy` to the existing Caddy site. Leave the scanner reverse proxy where it is.

## What you set

Create `/etc/mos/piper.env` on the droplet. It holds one variable, `PIPER_TTS_SECRET`, set to the shared secret. Do not commit that file.

On the website App Platform component, set the same secret as the run-and-build-time variable `PIPER_TTS_SECRET`. Set `PIPER_TTS_URL` to `https://178-128-171-45.sslip.io/v1/voice/piper`. `project.yml` already declares both names. The voice function sends the secret as a bearer token. An empty secret makes Piper refuse speech, and the function falls back to the browser voice.

## Deploy

```bash
cd /opt/mos/maintenanceos-website/deploy/piper-tts
docker compose up -d --build
curl --fail --silent --show-error http://127.0.0.1:8790/health
```

Health must return HTTP 200 and `{"ok":true,"engine":"piper","voice":"jenny_dioco"}` before the route is added.

Insert `caddy-route.caddy` as the first `handle` inside the existing site block, then:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
curl --fail --silent --show-error http://127.0.0.1:8790/health
```

A request without the bearer token must be HTTP 401. The port is published only on 127.0.0.1. The container is limited to 512 MB and 1 CPU. Speech times out at 8 seconds. Text longer than 400 characters is refused. Repeated text is served from `/var/cache/piper`, capped at 200 files.

The speaking screen says Jenny (Dioco). That name is the attribution the voice dataset requires.

## Rollback

Roll back if health fails, or if a speech request without a token is anything other than 401.

1. Delete the new `handle /v1/voice/piper*` block from `/etc/caddy/Caddyfile`. Do not change the scanner proxy. `sudo caddy validate --config /etc/caddy/Caddyfile` and `sudo systemctl reload caddy`.
2. `docker compose down` in `deploy/piper-tts`.
3. Clear `PIPER_TTS_URL` and `PIPER_TTS_SECRET` on the website component and redeploy the voice function. Speech then uses Gemini, and a Gemini failure uses the browser voice.

The scanner container stays running through every step.
