# QA

Handler tests feed three DigitalOcean event shapes: `http.body` as an object with `x-forwarded-for` as an array, `__ow_body` base64 with `__ow_method`, and `http.body` base64 with `isBase64Encoded`. Each returns a RIFF 24 kHz WAV string and calls Gemini without the key in the URL.

A throwing env getter returns a string body `{ ok: false, error: "voice_handler_error", fallback: "browser" }` and does not echo the exception or the key. The same cases run through `bundle.cjs`. The bundle does not reference `AbortSignal.timeout`.
