# Specification: WorkSmartOS bid-ready website

## Objective
Make the public WorkSmartOS site usable in a contract bid: the create-flow website check must finish or fail in a way the visitor can continue, a partial scan must say what was found and what was not, and the scanner image must match the droplet that is already live.

## Brand
WorkSmartOS is the brand. MaintenanceOS and ReceptionistOS are products under it. Visitor-facing legal pages say WorkSmartOS website. The company remains Chapelgate Limited (12340004). Colours stay navy `#0A1728`, cyan `#67E8F9`, type Inter.

## Acceptance criteria
- `/create` calls `POST /api/website/scan`. A successful scan fills only returned fields. A zero-fetch `PARTIAL` (`fetched: 0`) tells the visitor the pages could not be read and lets them continue. Timeout and 5xx retry once. A 4xx is not retried. The visitor can skip the check while it is running.
- A `PARTIAL` result with `fetched > 0` names the draft fields that were copied and the fields that are still blank, on the check step and the review step. The visitor can edit the blanks.
- The scanner's plain HTTPS fetch sends an honest browser-like user agent, `Accept`, and `Accept-Language`. It does not send `Authorization` or `Cookie`. A 401 or 403 on that fetch retries the document through Playwright after the public-HTTPS and DNS checks. A 404 does not. Tests cover a host that returns 401 for a bot user agent and 200 for the browser headers, and a host that 401s the plain client until the browser fetch.
- The scanner image is `mcr.microsoft.com/playwright:v1.63.0-noble`, runs as uid 1000, and reads `SCANNER_V2_STATE_ROOT=/data`. Deploy docs and `deploy/maintenanceos-scanner-v2/run.sh` use `--user 1000:1000` and mount `/var/lib/maintenanceos-scanner-v2` at `/data`. There is no `node` user and no `SCANNER_V2_STATE_DIR` setting.
- A scan copies a public business phone, a public contact email, and a postal or contact-block address when they are on the page, with source URL and confidence. Mailto links, visible text, JSON-LD, and the contact or footer are read, including simple obfuscation (`name [at] domain`, `(at)`, HTML entities, and Cloudflare `data-cfemail`). Script-built emails and personal addresses from blog, news, jobs, or team pages are not reconstructed. A postal address uses street, locality, and postcode, and omits region or country codes such as ENG and GB. The locality on the page is kept. Services are short list items under a services heading; slogan and call-to-action headings are dropped. FAQ pairs come from FAQ markup, a FAQ section, or a question heading with an answer paragraph. Date and byline answers are dropped. Every draft field is entity-decoded and tag-stripped.
- Phone, email, address, and hours are trusted from the home page or a shallow contact or opening-hours page. When a crawl has several distinct candidates, or more than eight pages, other pages are ignored. If more than one candidate remains, the most prominent one is kept and confidence is low.
- The first scan returns a usable draft within about 45 seconds. Home, contact, about, services, FAQ, and opening-hours URLs are fetched before posts. Once those pages are read, the result can be `CRAWLING` with the draft so far. `/create` shows changing progress text while it waits. `blocked_by_site` is unchanged.
- `/create` shows phone, contact email, and address as editable review fields. `http_404` and `content_type_not_supported` are a quiet "Some pages were skipped." note. State `CRAWLING` keeps the partial draft usable and offers Continue scanning, which sends the same website again. `blocked_by_site` is unchanged.
- Spoken demo lines try `POST /api/website/voice` and fall back to the browser voice. The function calls Gemini `generateContent` with `gemini-2.5-flash-preview-tts` (override `GEMINI_TTS_MODEL`), `responseModalities: ["AUDIO"]`, and prebuilt voice `Charon` (override `GEMINI_TTS_VOICE`; Algenib is the gravelly alternative). Google lists Charon as Informative. The page name stays Theatrical. The only secret is `GEMINI_API_KEY`, sent in `x-goog-api-key` and never in a URL, a log, or the browser. PCM comes back as `audio/wav`. A missing key, Gemini error, HTTP 429, or a timeout returns `fallback: "browser"`.

## Non-goals
- Changing frozen telephony.
- Adding `/status` to the sitemap.
- Inventing business facts when a page cannot be read.
