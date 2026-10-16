# Gemini voice web action

## Problem

`POST /api/website/voice` with `{"text":"Hi"}` returned HTTP 504 `text/html` in about 0.4s, with `x-openwhisk-activation-id`. The same Gemini key and model return audio in about 2s when called directly. The function activation failed before the JSON `fallback: "browser"` response.

## Cause

DigitalOcean Functions web actions may pass `x-forwarded-for` as an array. The handler called `.split` on that value outside its try/catch. The throw rejected the activation, so the edge returned an HTML 504 and never the JSON fallback. `readText` also ignored an already-parsed body and a base64 `__ow_body`, and the success body was a JavaScript object instead of the base64 string DigitalOcean expects for binary `audio/wav`.

## Acceptance

- Package `website` function `voice` stays `runtime: nodejs:22`, `main: main`, `web: true`, and the deployed file is `bundle.cjs`.
- The handler accepts `http.method` / `__ow_method`, lowercased headers that may be arrays, and a body that is a JSON string, a parsed object, or base64 when `isBase64Encoded` / `__ow_isBase64Encoded` is set.
- Header reads never call string methods on an array.
- Upstream timeout uses `AbortController`. A missing `fetch` returns `voice_unavailable` without throwing.
- Audio success is status 200, `Content-Type: audio/wav`, and a base64 string body. `isBase64Encoded` is not a response field.
- JSON results, including every error, use a string body. Any throw returns `{ ok: false, error: "voice_handler_error", fallback: "browser" }` with no exception text and no API key.
- The key stays in `x-goog-api-key` only.
