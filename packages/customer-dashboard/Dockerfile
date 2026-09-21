# Companion-only image for a *separate* Render free web service.
# Do NOT use this as the DigitalOcean App Platform spec — marketing stays
# `output: 'export'` static. Do NOT point this at frozen telephony
# (maintenanceos-redteam / production voice).
#
# Same process as repo-root `npm run customer-dashboard`:
#   node --experimental-strip-types packages/customer-dashboard/src/server.ts
#
# Build from the website repo root (Render dockerContext defaults to repo root):
#   docker build -f packages/customer-dashboard/Dockerfile -t mos-customer-dashboard .
#
# SAMPLE / DEMO catalogue only. Not production analytics. Not live telephony.
# Dashboard stays off until CUSTOMER_DASHBOARD_ENABLED=true.

FROM node:22-bookworm-slim

WORKDIR /app

COPY packages/customer-dashboard/package.json ./packages/customer-dashboard/package.json
COPY packages/customer-dashboard/src ./packages/customer-dashboard/src

# Public bind for PaaS health checks. PORT is injected by Render; the server
# also honours CUSTOMER_DASHBOARD_PORT. Dashboard stays off until
# CUSTOMER_DASHBOARD_ENABLED=true. Rows stay SAMPLE / DEMO when the catalogue is on.
ENV NODE_ENV=production
ENV CUSTOMER_DASHBOARD_HOST=0.0.0.0

USER node

EXPOSE 10000

HEALTHCHECK --interval=10s --timeout=3s --start-period=8s --retries=6 \
  CMD node -e "const p=process.env.CUSTOMER_DASHBOARD_PORT||process.env.PORT||'8791'; fetch('http://127.0.0.1:'+p+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--experimental-strip-types", "packages/customer-dashboard/src/server.ts"]
