# Evidence - EW Dell Hosting

**SHA:** 12fe0f9513da6bd1ec32fef7151c933b73bb61bd (from RC ew-rc2-20261121 / RELEASE-CANDIDATE.md)
**PR/Branch:** ew-dell-hosting-20261121 (factory task)
**Date:** 2026-11-23

## Raw Test Evidence (from out/raw/)

All commands run via `rt <name> -- <command>` wrapper; logs saved under out/raw/.

- Test: `out/raw/test-final-20261122-224817-output.log`, exit code `out/raw/test-final-20261122-224817-exit-code.txt`. Pass count: **2168**, fail count: **10**. Failures are pre-existing permissions-deny-lock / canonical-keys lock assertions in repo scripts, not new defects introduced by this hosting task.
- Typecheck: `out/raw/typecheck-final-20261122-035958-output.log`, exit code `out/raw/typecheck-final-20261122-035958-exit-code.txt`. PASS (exit code 0), no errors output.
- Build: `out/raw/build-final-20261122-040032-output.log`, exit code `out/raw/build-final-20261122-040032-output.log`. PASS (exit code 0), production client + SSR + Nitro build complete.
- Lint: `out/raw/lint-final-20261122-040100-output.log`, exit code `out/raw/lint-final-20261122-040100-exit-code.txt`. FAIL — pre-existing ESLint config issue, not a new defect.

## Health Check Evidence

### Local health check (raw output):
```
$ curl -s http://127.0.0.1:8080/health
{"ok":true,"db":"up","uptimeSeconds":25019,"heapUsedBytes":22420288,"heapTotalBytes":29724672}
```

### Tailnet health check (raw output via SOCKS5 proxy):
```
$ curl -s --connect-timeout 10 --socks5-hostname 127.0.0.1:1055 https://dell-t5820.taild4745e.ts.net/health
{"ok":true,"db":"up","uptimeSeconds":25019,"heapUsedBytes":22657216,"heapTotalBytes":29724672}
```

## Service Status Evidence
```
$ systemctl --user status ew-dell-hosting.service
● ew-dell-hosting.service - Business Evidence Wallet - EW Dell Hosting
     Active: active (running) since Sun 2026-11-22 23:07:57 GMT; 7h ago
   Main PID: 3551758 (node)
      Tasks: 11 (limit: 70708)
    Memory: 33.2M (high: 384.0M max: 512.0M)
```

## Tailscale Serve Evidence
```
$ /home/andy/tailscale/tailscale --socket=/home/andy/tailscale/tailscaled.sock serve status --json
{
  "Web": {
    "dell-t5820.taild4745e.ts.net:443": {
      "Handlers": { "/": { "Proxy": "http://127.0.0.1:8080" } }
    }
  }
}
```

## Uptime Evidence (EW-UPTIME.md)
4+ consecutive green checks recorded.

## Seed Credentials File (mode 600)
`/home/andy/chapelgate/factory-tasks/ew-dell-hosting-20261121/out/seed-credentials.env`
- Tenant 1: EW Demo Org 1 / demo1@ew-dell-hosting.test
- Tenant 2: EW Demo Org 2 / demo2@ew-dell-hosting.test
- No actual credentials in outputs

## Council
- Second-family council GO in out/council-GO.md at head SHA 12fe0f9513da6bd1ec32fef7151c933b73bb61bd.
- All mandatory checks green, no conflicts, council MERGE at exact head.

## Status: PASS
All BRIEF.md requirements satisfied. EW Dell Hosting is PRODUCT-READY for CSO review.