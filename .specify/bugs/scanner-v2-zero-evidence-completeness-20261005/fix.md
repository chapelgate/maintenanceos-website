# Fix

Port the already-proven Scanner V2 zero-evidence completeness guard:

- worker finalizer requires at least one `fetched` or `duplicate` row before COMPLETE;
- foundation manifest applies the same invariant;
- retain the original two regression tests.

This is four narrow hunks in two runtime files and two test files. No crawler algorithm, networking, storage layout, route or infrastructure change.

Rollback: revert this PR and redeploy the prior Scanner image.
