# Gemini voice web action

## Problem

`POST /api/website/voice` with `{"text":"Hi"}` still returns HTTP 504 `text/html` in under a second. The response header `x-do-orig-status: 503` shows the function itself returned 503 (`voice_not_configured` or another failure). DigitalOcean replaces every 5xx body with its own HTML 504 page, so the browser never sees the JSON fallback. The same key works when called directly against Gemini.

## Cause

The handler returned 503/502/504 with a JSON body. The DigitalOcean edge discards that body and serves HTML. The page must be able to read `{ ok: false, fallback: "browser", reason }` on every failure, and GET must say whether `GEMINI_API_KEY` is present without returning the key. `voice_not_configured` means the key did not reach the function. `upstream_<status>` means the key was sent and Gemini rejected the call.

## Acceptance

- Package `website` function `voice` stays `runtime: nodejs:22`, `main: main`, `web: true`, and the deployed file is `bundle.cjs`.
- The handler accepts `http.method` / `__ow_method`, lowercased headers that may be arrays, and a body that is a JSON string, a parsed object, or base64 when `isBase64Encoded` / `__ow_isBase64Encoded` is set.
- Header reads never call string methods on an array.
- Upstream timeout uses `AbortController`. A missing `fetch` returns HTTP 200 `{ reason: "internal_error" }` without throwing.
- Audio success is status 200, `Content-Type: audio/wav`, and a base64 string body. `isBase64Encoded` is not a response field.
- Failures are HTTP 200 JSON `{ ok: false, fallback: "browser", reason }` because DigitalOcean replaces every 5xx body with an HTML 504. Reasons include `voice_not_configured`, `text_missing`, `text_too_long`, `rate_limited`, `upstream_<status>`, `upstream_timeout`, `upstream_no_audio`, and `internal_error`. GET returns `{ ok: true, configured, model, voice }` and never the key. The page uses the browser voice when `fallback` is `browser`.
- The key stays in `x-goog-api-key` only.
