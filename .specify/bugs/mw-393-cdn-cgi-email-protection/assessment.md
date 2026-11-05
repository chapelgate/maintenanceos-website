# mw-393 assessment

## Bug

The Website Manager health monitor (`scripts/website-health-monitor.mjs`) collects internal page hrefs from rendered HTML on `https://worksmartos.co.uk`. Cloudflare injects a `<a href="/cdn-cgi/l/email-protection">` link into served HTML (it is not present in the site source). The monitor then requests `/cdn-cgi/l/email-protection` and records an HTTP 404 as a "broken internal link", causing `npm run website:monitor` to fail with `ok: false`.

## Scope

One-line change: skip `cdn-cgi/` paths when collecting internal links from page HTML. No site content, no config, no frozen paths.
