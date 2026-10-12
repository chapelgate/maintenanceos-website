# Fix

Keep `andy@chapelgatehome.uk` out of the server HTML on `/create`.

- `EnquiryUnavailable` renders the address only after hydration (`useSyncExternalStore` server snapshot is false).
- The `/create` steps list no longer repeats the address.

Cloudflare never rewrites the hydrated text, so error 418 does not fire. The mailto link still appears once the page has hydrated.

Rollback: revert this commit.
