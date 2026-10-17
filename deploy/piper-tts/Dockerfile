FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl tar \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/piper
COPY SHA256SUMS /opt/piper/SHA256SUMS
RUN curl -fsSL -o piper_linux_x86_64.tar.gz https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz \
  && curl -fsSL -L -o en_GB-jenny_dioco-medium.onnx https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_GB/jenny_dioco/medium/en_GB-jenny_dioco-medium.onnx \
  && curl -fsSL -L -o en_GB-jenny_dioco-medium.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_GB/jenny_dioco/medium/en_GB-jenny_dioco-medium.onnx.json \
  && sha256sum -c SHA256SUMS \
  && tar -xzf piper_linux_x86_64.tar.gz \
  && rm piper_linux_x86_64.tar.gz \
  && mkdir -p /var/cache/piper \
  && chown -R node:node /opt/piper /var/cache/piper

COPY server.mjs /opt/piper/server.mjs

USER node
ENV PIPER_BIN=/opt/piper/piper/piper \
    PIPER_MODEL=/opt/piper/en_GB-jenny_dioco-medium.onnx \
    PIPER_CACHE_DIR=/var/cache/piper \
    PORT=8790 \
    NODE_ENV=production
EXPOSE 8790
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8790/health').then((response)=>process.exit(response.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "/opt/piper/server.mjs"]
