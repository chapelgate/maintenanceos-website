# Companion-only image for a *separate* Render free web service.
# Do NOT use this as the DigitalOcean App Platform spec — marketing stays
# `output: 'export'` static. Do NOT point this at frozen telephony
# (maintenanceos-redteam / production voice).
#
# Same process as repo-root `npm run sandbox-test-call`:
#   node --experimental-strip-types packages/sandbox-test-call/src/server.ts
#
# Build from the website repo root (Render dockerContext defaults to repo root):
#   docker build -f packages/sandbox-test-call/Dockerfile -t mos-sandbox-test-call .
#
# Sessions stay in memory. Scripted demo only. WebRTC/live stay not_configured
# / live_call_forbidden. Sandbox stays off until SANDBOX_TEST_CALL_ENABLED=true.

FROM node:22-bookworm-slim

WORKDIR /app

COPY packages/sandbox-test-call/package.json ./packages/sandbox-test-call/package.json
COPY packages/sandbox-test-call/src ./packages/sandbox-test-call/src
COPY packages/receptionist-draft/package.json ./packages/receptionist-draft/package.json
COPY packages/receptionist-draft/src ./packages/receptionist-draft/src

# Public bind for PaaS health checks. PORT is injected by Render; the server
# also honours SANDBOX_TEST_CALL_PORT. Sandbox stays off until
# SANDBOX_TEST_CALL_ENABLED=true.
ENV NODE_ENV=production
ENV SANDBOX_TEST_CALL_HOST=0.0.0.0

USER node

EXPOSE 10000

HEALTHCHECK --interval=10s --timeout=3s --start-period=8s --retries=6 \
  CMD node -e "const p=process.env.SANDBOX_TEST_CALL_PORT||process.env.PORT||'8790'; fetch('http://127.0.0.1:'+p+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--experimental-strip-types", "packages/sandbox-test-call/src/server.ts"]
