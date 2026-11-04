# Fix

1. Restore the established `preload: false` setting for the Inter local font.
2. Encode apostrophes in JSX as `&apos;` to satisfy the lint gate without changing rendered copy.
3. Update the source-text trust assertion to match the encoded JSX.

Rollback is a single commit revert.
