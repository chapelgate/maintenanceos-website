# Plan

Keep the Gemini request, WAV wrap, cache, length cap, and per-IP limit. Change only the web-action boundary.

1. Coerce header values before reading the client address or origin.
2. Read `text` from the promoted field, a JSON string, a parsed object, or a base64 body when the request flag says so.
3. Return audio as a base64 string with `Content-Type: audio/wav`. Return JSON statuses as `JSON.stringify` strings.
4. Wrap the whole handler so a throw still returns `fallback: "browser"`.
5. Rebuild `bundle.cjs` and cover the DigitalOcean event shapes from the source and from the bundle.
