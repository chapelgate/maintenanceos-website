# Fix

- `#demo-conversion-tabs` scrolls into view on load and on `hashchange` when the hash is `#demo` or `#launch`. `scroll-margin-top: 5.5rem` keeps that block below the sticky header. The existing `scroll-padding-top` on `html` stays.
- Arrow, Home, and End keys run on the tab buttons. They select the matching tab and focus that button. The tab list has no `tabIndex`.
- `unsafePublicUrlMessage` refuses `http://`, `localhost`, and private or loopback IPv4 (`10.*`, `172.16`–`31.*`, `192.168.*`, `127.*`) before step 2. The existing `role="alert"` paragraph shows that specific message. `https://example.com` still continues.
