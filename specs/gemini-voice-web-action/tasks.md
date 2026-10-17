# Tasks

- [x] Accept array headers and parsed, string, and base64 web-action bodies
- [x] Return base64 `audio/wav` and stringified JSON fallbacks
- [x] Catch handler throws as `internal_error` with `fallback: "browser"`
- [x] Rebuild `bundle.cjs` and test the bundle against those event shapes
- [x] Return HTTP 200 JSON for every failure, with a non-secret `reason`
- [x] GET health reports `configured` without the key
- [x] Accept an `AQ.` key and report key length and prefix kind without the key
- [x] Declare package `environment` so build-time Gemini and scanner URL values reach the functions
- [x] GET lists matching env names and a total key count, never values
- [x] The page reads `reason` and uses the browser voice on fallback
- [x] A Gemini failure speaks through Piper before the browser voice
