# Step 46 â€” performance / Core Web Vitals baseline

Date: 2026-09-25
Owner: MOS Website Manager
Tool: Lighthouse 13.5.0, live DigitalOcean site, Edge 153
Scope: Home, Property maintenance software, Contact; mobile + desktop lab profiles

## Important evidence boundary

Google PageSpeed Insights returned HTTP 429 during the check, so no CrUX/field Core Web Vitals claim is made here. The figures below are **Lighthouse lab measurements**, not real-user field data.

## Live Lighthouse results

| Page | Profile | Performance | FCP | LCP | CLS | TBT | Transfer |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | Mobile | 95 | 1.158s | 2.772s first run | 0 | 103ms | 220 KB |
| Home | Desktop | 99 | 0.472s | 0.840s | 0 | 0ms | 306 KB |
| Property maintenance software | Mobile | 98 | 0.943s | 2.258s | 0 | 65ms | 175 KB |
| Property maintenance software | Desktop | 100 | 0.266s | 0.417s | 0 | 0ms | 182 KB |
| Contact | Mobile | 100 | 0.924s | 1.762s | 0 | 19ms | 185 KB |
| Contact | Desktop | 100 | 0.282s | 0.433s | 0 | 0ms | 185 KB |

The Home mobile LCP was repeated twice because the first run was above the 2.5s good threshold. Independent Home mobile LCP runs were:

- 2.772s
- 1.827s
- 1.828s

Median: **1.828s**.

The measured Home LCP element is hero text, not an image. Lighthouse showed 76.8ms TTFB and ~228ms element render delay in the first run. Because the repeat median is comfortably under 2.5s, no speculative font/render-path change is justified.

## Lab acceptance targets

These are regression budgets, not claims about field CWV:

- median mobile LCP on the Home page: <= 2.5s
- mobile LCP on core category/contact pages: <= 2.5s
- CLS: <= 0.1
- TBT: <= 200ms
- Lighthouse performance score: >= 90
- no third-party analytics/marketing scripts

## Build asset budget

Run after `npm run build`:

```bash
npm run performance:budget
```

The zero-dependency budget checks each exported HTML page and caps first-party initial JS/CSS referenced by that page. The raw initial-JS ceiling is 525 KB per exported page: about 8% above the current largest 485 KB page. This is intentionally separate from compressed network transfer (175–306 KB in the Lighthouse runs) and catches material build growth without failing the known-good baseline.

## Reuse / cost

Lighthouse was run one-off from the official npm package and was not added to project dependencies. No performance SaaS, paid monitor, new runner, browser service, or infrastructure was created.
