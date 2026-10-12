# Test

- `scripts/pricing-copy.test.mjs` counts "invented list prices" across the pricing page and config and expects one hit, with the array indented at column 0.
- `scripts/seo-discoverability.test.mjs` rejects `#demo` in `llms.txt`, requires the `/demo/` URL, and rejects a blank line inside Contact.

Verdict: verified locally before merge.
