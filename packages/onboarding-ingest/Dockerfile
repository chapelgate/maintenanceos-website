# Persistent Scanner V2 runtime only. Marketing remains a static export.
# NO RENDER. Golden MaintenanceOS telephony is out of scope.
FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

COPY packages/onboarding-ingest/package.json packages/onboarding-ingest/package-lock.json ./packages/onboarding-ingest/
RUN npm ci --omit=dev --no-audit --no-fund --prefix packages/onboarding-ingest

COPY packages/onboarding-ingest/src ./packages/onboarding-ingest/src

ENV NODE_ENV=production
ENV ONBOARDING_SCAN_HOST=0.0.0.0
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

EXPOSE 8788

HEALTHCHECK --interval=10s --timeout=3s --start-period=8s --retries=6 CMD node -e "const p=process.env.ONBOARDING_SCAN_PORT||process.env.PORT||'8788'; fetch('http://127.0.0.1:'+p+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--use-system-ca", "--experimental-strip-types", "packages/onboarding-ingest/src/server.ts"]