# Specification: Neural voice when Gemini is out of quota

## Objective
A visitor on `/create` hears a natural en_GB voice when Gemini returns no audio. The order is Gemini, then the self-hosted Piper voice Jenny (Dioco), then the browser voice.

## Acceptance criteria
- `POST /api/website/voice` still returns `audio/wav` when speech succeeds, and HTTP 200 JSON `{ ok: false, fallback: "browser", engine: "browser", reason }` when it does not. A success names the engine in `X-Voice-Engine` as `gemini` or `piper`.
- Piper runs only when `PIPER_TTS_URL` and `PIPER_TTS_SECRET` are both set. The function sends the secret as a bearer token and does not put it in the response. A Piper failure, including a timeout of 8 seconds, stays HTTP 200 with reason `piper_unavailable`.
- Repeated text is served from the function memory for 10 minutes, keyed by a SHA-256 of the text, up to 32 entries. Text longer than 400 characters is refused. The existing per-address limit of 6 posts a minute still applies.
- The label under the microphone says `Gemini voice`, `Neural voice (Jenny Dioco)`, or `Browser voice`. A fallback still writes `console.warn`. Playback stays on the tap-unlocked audio context. The page CSP keeps `media-src 'self'` because that path does not need a blob URL.
- A `rate_limited` response stays HTTP 200. The label says `Browser voice`, the warning names `rate_limited`, and the screen says the preview limit was reached and this reply uses the browser voice.
- The Piper container is not the scanner container. It listens on 127.0.0.1 port 8790, has its own health URL, and is reached through one new Caddy route. The model and the Piper binary are pinned by SHA-256.

## Non-goals
- Training a voice.
- Changing the scanner image or its Caddy proxy.
- Putting a secret value in the repository.
