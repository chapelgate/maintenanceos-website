# Test

Verdict: verified for BUG reproduction and the surgical fix. Merge remains blocked until the fresh full PR validation run is green.

Evidence:
- deployed Scanner image: `maintenanceos-scanner-v2:cadce5c`;
- Scanner release SHA: `cadce5cf66740984aefb81c290265abe45c7ecd0`;
- public HTTPS health: PASS;
- HTTPS edge restart proof: PASS;
- CORS preflight from `https://seahorse-app-4oasq.ondigitalocean.app`: HTTP 204 with matching `Access-Control-Allow-Origin`;
- real multi-page Express Gas crawl on the deployed SHA: 17 URL records and 146 persisted knowledge chunks;
- Alley Gates skip is evidenced external anti-bot/auth behaviour (401 default request, 403 browser-style request), not a Scanner transport failure;
- App Platform stale `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` was proven and replaced with the new Scanner V2 HTTPS URL before source activation;
- first PR validation run `37381756196`: 438/439 tests passed; the sole failure was a pre-existing assertion expecting `main: main` while the accepted project manifest is `main: bundle.cjs`;
- this BUG changes that exact stale assertion to `main: bundle.cjs`, matching `project.yml`, `.include`, and the already-present loadable `bundle.cjs`.

No production telephony, carrier routing, phone number, provider credential or golden voice configuration was modified or exercised.
