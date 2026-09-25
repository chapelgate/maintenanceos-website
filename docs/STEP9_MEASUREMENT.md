# Step 9 measurement — privacy-minimised website KPIs

Date: 2026-09-25
Owner: MOS Website Manager

## 9.1 KPI definitions

The website measures aggregate operational performance, not individual people.

| KPI | Definition | Why |
| --- | --- | --- |
| Page views | count of `page_view` events | traffic baseline |
| Conversion CTA clicks | count of same-origin clicks to `/create/`, `/demo/`, `/contact/`, or `/pricing/` | buyer intent |
| Lead-form starts | `form_submit_start` | form engagement |
| Durable leads | count of stored `website.lead` records | commercial outcome |
| Lead conversion rate | durable leads / page views | funnel performance |
| Form errors | `form_submit_error` | failed-form monitoring |
| Client errors | max one anonymous `client_error` event per page load | page-error monitoring |
| Broken links | live crawl failures from `npm run website:monitor` | site health |

No unique-user/visitor KPI is attempted because there is deliberately no visitor identifier.

## 9.2 Privacy-conscious measurement

The browser sends only:
- event name;
- current pathname (never query string or fragment);
- conversion target pathname when relevant;
- lead type for form lifecycle events;
- a random per-event id used only to make network retries idempotent.

The event record does **not** contain email, name, organisation, message, IP, referrer, user-agent, cookie ID, localStorage ID, session ID, advertising ID, query string, error message, stack trace, or fingerprint.

No cookie, localStorage, sessionStorage, third-party analytics SDK, tracking pixel, or marketing tag is used. Ordinary hosting/network infrastructure can still process connection metadata transiently; the draft Privacy/Cookie pages remain subject to legal review.

## 9.3 Events

Allowed events are intentionally fixed:
`page_view`, `cta_click`, `form_submit_start`, `form_submit_success`, `form_submit_error`, `client_error`.

There is no free-form metadata property.

## 9.4 Health monitoring

Run:

```
npm run website:monitor
```

It:
- loads the live sitemap;
- fetches every sitemap page;
- discovers and checks internal links;
- reports non-2xx pages/assets;
- verifies the existing Railway control plane is ready on Postgres;
- verifies the website-event endpoint accepts the production site's CORS preflight.

Failed forms and generic client runtime errors are also counted through the event stream. The client error event deliberately omits error text and stack traces.

## 9.5 Recurring weekly report

The existing Railway control plane creates one `website.report.weekly` marker per UTC week. The first accepted anonymous event in a new week atomically claims the previous-week report, aggregates `website.event` and durable `website.lead` records, then emails the existing operator inbox using the already-configured sending-only Resend route.

The report contains aggregate counts and top page paths only. It does not include visitor identifiers or lead contact details.

This event-triggered schedule avoids GitHub Actions, a cron service, another worker, another database, or another credential. If there is no site traffic, there is no meaningful report to send; the next event resumes the weekly cycle.

## Isolation

`website.event` and `website.report.weekly` are measurement records only. They do not authorize jobs, approvals, telephony, payments, refunds, contractor dispatch, or customer-state changes.
