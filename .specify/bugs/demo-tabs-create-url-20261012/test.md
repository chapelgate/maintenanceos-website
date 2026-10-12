# Test

Headless Chromium against `http://localhost:3210`.

Demo tabs, header bottom 65px:

- `/demo/#demo`: tabs top 176, selected "Request early access". Tab list `tabindex` was null.
- `/demo/#launch`: tabs top 176, selected "Join launch list".
- The home link `a[href="/demo/#demo"]` landed on the same place with "Request early access" selected.
- From "Join launch list", End and ArrowRight focused "Request early access". Home and ArrowLeft focused "Join launch list". The focused element was the selected tab.

`/create` step 1, alert `p[role="alert"]`:

- `http://example.com`, `https://10.1.2.3`, `https://192.168.0.8`, `https://172.16.5.5`, `https://172.31.1.1`, `https://127.0.0.1`, and `localhost` each showed "Enter a public https:// website..." and stayed off step 2.
- `https://example.com` reached `data-create-step="2"`.

`node --experimental-strip-types --test src/lib/onboarding-create.test.ts` passed, including the private-range boundaries `172.15` and `172.32`.

Verdict: verified locally before merge. Live pages are checked after App Platform deploys the merge.
