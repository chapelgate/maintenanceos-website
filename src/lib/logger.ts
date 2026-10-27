// Bounded logging utility — no secrets, no PII, no user data.
type LogLevel = { DEBUG: number; INFO: number; WARN: number; ERROR: number };

const LogLevel: LogLevel = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

type LevelName = "DEBUG" | "INFO" | "WARN" | "ERROR";

const levelFromEnv = (): keyof typeof LogLevel => {
  const v = process.env.LOG_LEVEL?.toLowerCase();
  if (v === "debug") return "DEBUG";
  if (v === "info") return "INFO";
  if (v === "warn") return "WARN";
  if (v === "error") return "ERROR";
  return "INFO";
};

const CURRENT_LEVEL = LogLevel[levelFromEnv()];
const PII_KEYS: string[] = [
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
    const isPii = PII_KEYS.some((pk: string) => kl.includes(pk));
    out[k] = isPii ? "[REDACTED]" : sanitize(v);
  }
  return out;
}

function format(level: string, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const m = meta !== undefined ? ` ${JSON.stringify(sanitize(meta))}` : "";
  return `[${ts}] ${level}: ${message}${m}`;
}

export const logger = {
  debug: (message: string, meta?: unknown) => {
    if (CURRENT_LEVEL <= LogLevel.DEBUG)
      console.debug(format("DEBUG", message, meta));
  },
  info: (message: string, meta?: unknown) => {
    if (CURRENT_LEVEL <= LogLevel.INFO)
      console.info(format("INFO", message, meta));
  },
  warn: (message: string, meta?: unknown) => {
    if (CURRENT_LEVEL <= LogLevel.WARN)
      console.warn(format("WARN", message, meta));
  },
  error: (message: string, meta?: unknown) => {
    if (CURRENT_LEVEL <= LogLevel.ERROR)
      console.error(format("ERROR", message, meta));
  },
};
