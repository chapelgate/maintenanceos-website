#!/usr/bin/env node
/**
 * Local form-endpoint stub for the static marketing site.
 * Implements docs/FORM_ENDPOINT_CONTRACT.md. Never sends email.
 *
 *   npm run form-stub
 *   NEXT_PUBLIC_FORM_ENDPOINT=http://127.0.0.1:8787/leads npm run dev
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const LEAD_TYPES = new Set([
  "launch_list",
  "early_demo",
  "contact",
  "create_receptionist",
]);
export const MAX_BODY_BYTES = 32 * 1024;
export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8787;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function jsonHeaders(origin) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...corsHeaders(origin),
  };
}

export const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://worksmartos.co.uk",
]);

export function corsHeaders(origin) {
  const allowed =
    process.env.FORM_STUB_CORS_ORIGIN ||
    (origin && ALLOWED_ORIGINS.has(origin) ? origin : "");
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function successBody() {
  return {
    ok: true,
    mode: "queued_stub",
    sends_email: false,
  };
}

/**
 * @param {unknown} payload
 * @returns {{ ok: true, discarded?: boolean, record: object } | { ok: false, error: string, status: number }}
 */
export function validateLead(payload) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "JSON object required.", status: 400 };
  }
  const body = /** @type {Record<string, unknown>} */ (payload);

  const website = typeof body.website === "string" ? body.website.trim() : "";
  if (website) {
    return {
      ok: true,
      discarded: true,
      record: { discarded: true, reason: "honeypot" },
    };
  }

  const leadType = typeof body.lead_type === "string" ? body.lead_type.trim() : "";
  if (!LEAD_TYPES.has(leadType)) {
    return {
      ok: false,
      error:
        "lead_type must be launch_list, early_demo, contact, or create_receptionist.",
      status: 400,
    };
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !EMAIL_RE.test(email)) {
    return {
      ok: false,
      error: "Please enter a valid email address.",
      status: 400,
    };
  }

  const optionalString = (key) => {
    const value = body[key];
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
  };

  return {
    ok: true,
    record: {
      received_at: new Date().toISOString(),
      lead_type: leadType,
      email,
      name: optionalString("name"),
      organisation: optionalString("organisation"),
      role: optionalString("role"),
      message: optionalString("message"),
      source: optionalString("source") ?? "maintenanceos-website",
      public_launch: body.public_launch === true,
      sends_email: false,
    },
  };
}

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error("payload too large");
      error.code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function send(res, status, origin, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, jsonHeaders(origin));
  res.end(body);
}

function pathnameOf(req) {
  try {
    return new URL(req.url ?? "/", "http://127.0.0.1").pathname;
  } catch {
    return "/";
  }
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {{ dataFile: string, appendLead?: (record: object) => Promise<void> | void }} options
 */
export async function handleFormStubRequest(req, res, options) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const method = (req.method ?? "GET").toUpperCase();
  const pathname = pathnameOf(req);

  if (method === "OPTIONS") {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (method === "GET" && (pathname === "/health" || pathname === "/health/")) {
    send(res, 200, origin, {
      ok: true,
      service: "maintenanceos-form-stub",
      sends_email: false,
      leads_path: "/leads",
    });
    return;
  }

  if (pathname !== "/leads" && pathname !== "/leads/") {
    send(res, 404, origin, { ok: false, error: "Not found." });
    return;
  }

  if (method !== "POST") {
    res.writeHead(405, {
      ...jsonHeaders(origin),
      Allow: "POST, OPTIONS",
    });
    res.end(JSON.stringify({ ok: false, error: "Method not allowed. POST JSON to /leads." }));
    return;
  }

  let raw;
  try {
    raw = await readBody(req, MAX_BODY_BYTES);
  } catch (err) {
    if (err && err.code === "PAYLOAD_TOO_LARGE") {
      send(res, 413, origin, { ok: false, error: "Payload too large." });
      return;
    }
    send(res, 400, origin, { ok: false, error: "Could not read request body." });
    return;
  }

  let parsed;
  try {
    parsed = raw.length === 0 ? {} : JSON.parse(raw.toString("utf8"));
  } catch {
    send(res, 400, origin, { ok: false, error: "Invalid JSON." });
    return;
  }

  const result = validateLead(parsed);
  if (!result.ok) {
    send(res, result.status, origin, { ok: false, error: result.error });
    return;
  }

  if (!result.discarded) {
    const masked = { ...result.record, email: "[REDACTED]" };
    try {
      if (options.appendLead) {
        await options.appendLead(result.record);
      } else {
        await appendJsonl(options.dataFile, masked);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "write failed";
      send(res, 500, origin, { ok: false, error: `Could not record lead (${message}).` });
      return;
    }
    console.log(
      `[form-stub] queued_stub lead_type=${result.record.lead_type} email=[REDACTED] sends_email=false`,
    );
  } else {
    console.log("[form-stub] honeypot discarded; no email sent");
  }

  send(res, 200, origin, successBody());
}

async function appendJsonl(filePath, record) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

export function createFormStubServer(options = {}) {
  const dataFile =
    options.dataFile ??
    process.env.FORM_STUB_DATA_FILE ??
    path.resolve(process.cwd(), ".data/form-stub-leads.jsonl");

  const server = http.createServer((req, res) => {
    handleFormStubRequest(req, res, { dataFile, appendLead: options.appendLead }).catch(
      (err) => {
        console.error("[form-stub] unhandled", err);
        if (!res.headersSent) {
          const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
          send(res, 500, origin, { ok: false, error: "Internal stub error." });
        }
      },
    );
  });

  return { server, dataFile };
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

export function listenFormStub(options = {}) {
  const host = options.host ?? process.env.FORM_STUB_HOST ?? DEFAULT_HOST;
  const port = Number(options.port ?? process.env.FORM_STUB_PORT ?? DEFAULT_PORT);
  const { server, dataFile } = createFormStubServer(options);

  server.listen(port, host, () => {
    console.log(`[form-stub] listening on http://${host}:${port}/leads`);
    console.log(`[form-stub] health    http://${host}:${port}/health`);
    console.log(`[form-stub] jsonl     ${dataFile}`);
    console.log("[form-stub] never sends email; mode is always queued_stub");
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  return server;
}

if (isDirectRun()) {
  listenFormStub();
}
