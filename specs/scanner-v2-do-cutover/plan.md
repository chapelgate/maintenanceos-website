# Plan

1. Provider preflight, read-only:
   - verify exact droplet identity/status;
   - locate the existing `seahorse-app` App Platform app;
   - read its ingress spec;
   - enumerate existing Functions namespaces and locate exactly one deployed `website/scan`;
   - read the direct function URL and black-box its current response;
   - fail closed if any identity is ambiguous.

2. Preserve rollback:
   - snapshot existing Scanner V2 droplet immediately before first mutation;
   - record current Function URL/provider state and current website release SHA.

3. Deploy runtime to the existing droplet:
   - transfer the exact candidate source only;
   - build the already-verified Scanner V2 Dockerfile;
   - keep the Node port loopback-only;
   - mount durable state;
   - pin `SCANNER_V2_RELEASE_SHA` to the exact candidate;
   - expose only HTTPS via the existing droplet IP using a publicly trusted IP certificate;
   - preserve SSH access.

4. Verify runtime before cutover:
   - trusted HTTPS health;
   - direct bounded scan canary;
   - durable state survives container restart.

5. Reuse the existing Function:
   - deploy only to the namespace already containing `website/scan`;
   - provide `SCANNER_V2_RUNTIME_URL` via deployment environment, not source hardcoding;
   - keep current Function validation/rate/SSRF boundary;
   - repair App Platform ingress only if the read-only preflight proves it is stale/broken.

6. Acceptance:
   - direct function URL;
   - same-origin `/api/website/scan`;
   - Alley Gates and Express Gas canaries;
   - 390x844 browser `/create` flow;
   - exact release SHA;
   - full repo/accessibility/build/security gates.

## Rollback

- runtime: restore the pre-cutover droplet snapshot or stop the new container/reverse proxy;
- Function: redeploy the recorded pre-cutover Function package/config, retaining the pre-existing Railway fallback only as rollback;
- App ingress: restore the exact captured pre-cutover App spec if changed;
- source: revert the cutover PR;
- telephony is never part of rollback because it is never touched.
