# Companion-only image for a *separate* Render free web service.
# Do NOT use this as the DigitalOcean App Platform spec — marketing stays
# `output: 'export'` static. Do NOT point this at frozen telephony
# (maintenanceos-redteam / production voice).
#
# Same process as repo-root `npm run onboarding-scan`:
#   node --experimental-strip-types packages/onboarding-ingest/src/server.ts
#
# Build from the website repo root (Render dockerContext defaults to repo root):
#   docker build -f packages/onboarding-ingest/Dockerfile -t mos-onboarding-scan .

FROM node:22-bookworm-slim

WORKDIR /app

COPY packages/onboarding-ingest/package.json ./packages/onboarding-ingest/package.json
COPY packages/onboarding-ingest/src ./packages/onboarding-ingest/src

# Public bind for PaaS health checks. PORT is injected by Render; the server
# also honours ONBOARDING_SCAN_PORT. Crawl stays off until ONBOARDING_WEB_INGEST=true.
ENV NODE_ENV=production
ENV ONBOARDING_SCAN_HOST=0.0.0.0

USER node

EXPOSE 10000

HEALTHCHECK --interval=10s --timeout=3s --start-period=8s --retries=6 \
  CMD node -e "const p=process.env.ONBOARDING_SCAN_PORT||process.env.PORT||'8788'; fetch('http://127.0.0.1:'+p+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--experimental-strip-types", "packages/onboarding-ingest/src/server.ts"]
