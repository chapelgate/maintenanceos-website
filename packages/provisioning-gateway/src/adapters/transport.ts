import type { AdapterTransport } from "./types.ts";

export const fetchAdapterTransport: AdapterTransport = async (request) => {
  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  return {
    status: response.status,
    body: await response.text(),
  };
};
