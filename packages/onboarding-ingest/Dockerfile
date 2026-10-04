# Companion-only image for a *separate* DigitalOcean droplet.
# Do NOT use this as the DigitalOcean App Platform spec — marketing stays
# `output: 'export'` static. Do NOT point this at frozen telephony
# (maintenanceos-redteam / production voice). Do NOT apply render.yaml
# (legacy / do not use).
#
# Same process as repo-root `npm run onboarding-scan`:
#   node --use-system-ca --experimental-strip-types packages/onboarding-ingest/src/server.ts
#
# Build from the website repo root:
#   docker build -f packages/onboarding-ingest/Dockerfile -t mos-onboarding-scan .

FROM node:22-bookworm-slim

WORKDIR /app

COPY packages/onboarding-ingest/package.json packages/onboarding-ingest/package-lock.json ./packages/onboarding-ingest/
RUN npm ci --omit=dev --no-audit --no-fund --prefix packages/onboarding-ingest
RUN PLAYWRIGHT_BROWSERS_PATH=/ms-playwright ./packages/onboarding-ingest/node_modules/.bin/playwright install --with-deps --only-shell chromium

COPY packages/onboarding-ingest/src ./packages/onboarding-ingest/src

# Public bind inside the container. On the droplet, publish 127.0.0.1:8788
# and reverse-proxy HTTPS. PORT / ONBOARDING_SCAN_PORT select the listen port.
# Crawl stays off until ONBOARDING_WEB_INGEST=true.
ENV NODE_ENV=production
ENV ONBOARDING_SCAN_HOST=0.0.0.0
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

USER node

EXPOSE 8788

HEALTHCHECK --interval=10s --timeout=3s --start-period=8s --retries=6 \
  CMD node -e "const p=process.env.ONBOARDING_SCAN_PORT||process.env.PORT||'8788'; fetch('http://127.0.0.1:'+p+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--use-system-ca", "--experimental-strip-types", "packages/onboarding-ingest/src/server.ts"]
