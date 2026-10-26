# Plan
1. Unit-lock `_content_length` invalid/conflict paths.
2. Drive HttpSecurityBoundary with a raw ASGI scope for declared oversize.
3. Lock MAX_REQUEST_BYTES at 64 KiB.
