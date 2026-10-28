// Bounded logging utility — no secrets, no PII, no user data.
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface TraceContext {
  traceId?: string;
  requestId?: string;
  spanId?: string;
}

const levelFromEnv = (): LogLevel => {
  const v = process.env.LOG_LEVEL?.toLowerCase();
  if (v === "debug") return LogLevel.DEBUG;
  if (v === "info") return LogLevel.INFO;
  if (v === "warn") return LogLevel.WARN;
  if (v === "error") return LogLevel.ERROR;
  return LogLevel.INFO;
};

const CURRENT_LEVEL = levelFromEnv();
const PII_KEYS = [
  "email",
  "password",
  "token",
  "secret",
  "key",
  "authorization",
  "cookie",
  "session",
  "phone",
  "address",
  "postcode",
  "card",
  "iban",
  "sort",
  "account",
  "ni",
  "nhs",
  "passport",
  "driving",
  "licence",
  "credit",
  "cvv",
];

function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const kl = k.toLowerCase();
    const isPii = PII_KEYS.some((pk) => kl.includes(pk));
    out[k] = isPii ? "[REDACTED]" : sanitize(v);
  }
  return out;
}

function format(
  level: string,
  message: string,
  meta?: unknown,
  traceCtx?: TraceContext
): string {
  const ts = new Date().toISOString();
  const m = meta !== undefined ? ` ${JSON.stringify(sanitize(meta))}` : "";
  const t = traceCtx && (traceCtx.traceId || traceCtx.requestId)
    ? ` traceId=${traceCtx.traceId} requestId=${traceCtx.requestId}`
    : "";
  return `[${ts}] ${level}: ${message}${m}${t}`;
}

export interface Logger {
  debug: (message: string, meta?: unknown, traceCtx?: TraceContext) => void;
  info: (message: string, meta?: unknown, traceCtx?: TraceContext) => void;
  warn: (message: string, meta?: unknown, traceCtx?: TraceContext) => void;
  error: (message: string, meta?: unknown, traceCtx?: TraceContext) => void;
}

export const logger: Logger = {
  debug: (message, meta, traceCtx) => {
    if (CURRENT_LEVEL <= LogLevel.DEBUG) console.debug(format("DEBUG", message, meta, traceCtx));
  },
  info: (message, meta, traceCtx) => {
    if (CURRENT_LEVEL <= LogLevel.INFO) console.info(format("INFO", message, meta, traceCtx));
  },
  warn: (message, meta, traceCtx) => {
    if (CURRENT_LEVEL <= LogLevel.WARN) console.warn(format("WARN", message, meta, traceCtx));
  },
  error: (message, meta, traceCtx) => {
    if (CURRENT_LEVEL <= LogLevel.ERROR) console.error(format("ERROR", message, meta, traceCtx));
  },
};
