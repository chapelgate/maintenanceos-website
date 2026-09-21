# Companion-only image for a *separate* Render free web service.
# Do NOT use this as the DigitalOcean App Platform spec — marketing stays
# `output: 'export'` static. Do NOT point this at frozen telephony
# (maintenanceos-redteam / production voice).
#
# Same process as repo-root `npm run calendar-adapters`:
#   node --experimental-strip-types packages/calendar-adapters/src/server.ts
#
# Build from the website repo root (Render dockerContext defaults to repo root):
#   docker build -f packages/calendar-adapters/Dockerfile -t mos-calendar-adapters .
#
# Hosted path is mock-only. Do not bake Google/Microsoft secrets into the image.
# Adapters stay off until CALENDAR_ADAPTERS_ENABLED=true.

FROM node:22-bookworm-slim

WORKDIR /app

COPY packages/calendar-adapters/package.json ./packages/calendar-adapters/package.json
COPY packages/calendar-adapters/src ./packages/calendar-adapters/src

# Public bind for PaaS health checks. PORT is injected by Render; the server
# also honours CALENDAR_ADAPTERS_PORT. Adapters stay off until
# CALENDAR_ADAPTERS_ENABLED=true.
ENV NODE_ENV=production
ENV CALENDAR_ADAPTERS_HOST=0.0.0.0
ENV CALENDAR_ADAPTER_PROVIDER=mock

USER node

EXPOSE 10000

HEALTHCHECK --interval=10s --timeout=3s --start-period=8s --retries=6 \
  CMD node -e "const p=process.env.CALENDAR_ADAPTERS_PORT||process.env.PORT||'8789'; fetch('http://127.0.0.1:'+p+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--experimental-strip-types", "packages/calendar-adapters/src/server.ts"]
