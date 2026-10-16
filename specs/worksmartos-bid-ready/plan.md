# Plan
1. Keep the marketing site a static export. Same-origin scan stays the DigitalOcean function at `packages/onboarding-ingest/packages/website/scan`, which proxies to the droplet scanner.
2. Make the create form retry once, offer a skip, and treat zero-fetch as a failed read the visitor can finish by hand.
3. Change the scanner user agent and page headers, and recover a 401/403 document through Chromium only after the SSRF checks. Keep injected tests from launching a browser unless they pass a browser fetch.
4. Point the droplet image at the Playwright noble base, uid 1000, and `SCANNER_V2_STATE_ROOT=/data`. Document the host mount.
5. Show a partial scan as found versus still blank, and prove it in the built `/create` page with a mocked scanner.
6. Serve the Theatrical preview from Gemini text-to-speech. The only function secret is `GEMINI_API_KEY`. `GEMINI_TTS_MODEL` and `GEMINI_TTS_VOICE` are optional plain env. Fall back to the browser voice when Gemini cannot be used.
7. Copy phone, email, address, services, hours, and covered areas from pages that have no schema.org. Keep the draft usable when the crawl is still `CRAWLING`, and do not present skipped pages as a failed scan.
8. Read contact details from mailto, visible text, JSON-LD, and simple obfuscation. Prefer the home and contact pages, fetch those URL patterns first, and return the draft within about 45 seconds.
