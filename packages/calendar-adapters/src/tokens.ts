/**
 * Local token store for Google Calendar OAuth.
 * In-memory (process lifetime) or a gitignored file stub.
 * Never log token values. Hosted Render stays mock-only — do not put secrets there.
 */

import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type GoogleStoredTokens = {
  provider: "google";
  refreshToken: string;
  accessToken?: string;
  expiresAt?: number;
  calendarId?: string;
  updatedAt?: string;
};

export type TokenStore = {
  get(provider: "google"): Promise<GoogleStoredTokens | null>;
  set(tokens: GoogleStoredTokens): Promise<void>;
  clear(provider: "google"): Promise<void>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function parseGoogleStoredTokens(value: unknown): GoogleStoredTokens | null {
  const rec = asRecord(value);
  const refreshToken =
    typeof rec?.refreshToken === "string" ? rec.refreshToken.trim() : "";
  if (!refreshToken) return null;
  const accessToken =
    typeof rec.accessToken === "string" && rec.accessToken.trim()
      ? rec.accessToken.trim()
      : undefined;
  const expiresAt = typeof rec.expiresAt === "number" ? rec.expiresAt : undefined;
  const calendarId =
    typeof rec.calendarId === "string" && rec.calendarId.trim()
      ? rec.calendarId.trim()
      : undefined;
  const updatedAt =
    typeof rec.updatedAt === "string" && rec.updatedAt.trim()
      ? rec.updatedAt.trim()
      : undefined;
  return {
    provider: "google",
    refreshToken,
    accessToken,
    expiresAt,
    calendarId,
    updatedAt,
  };
}

export function createMemoryTokenStore(
  initial: GoogleStoredTokens | null = null,
): TokenStore {
  let google: GoogleStoredTokens | null = initial
    ? parseGoogleStoredTokens(initial)
    : null;
  return {
    async get(provider) {
      return provider === "google" ? google : null;
    },
    async set(tokens) {
      const parsed = parseGoogleStoredTokens(tokens);
      if (!parsed) return;
      google = { ...parsed, updatedAt: new Date().toISOString() };
    },
    async clear(provider) {
      if (provider === "google") google = null;
    },
  };
}

type FileShape = { google?: Record<string, unknown> };

export function createFileTokenStore(filePath: string): TokenStore {
  const resolved = path.resolve(filePath);

  async function readFileShape(): Promise<FileShape> {
    try {
      const raw = await readFile(resolved, "utf8");
      const parsed: unknown = JSON.parse(raw);
      const rec = asRecord(parsed);
      if (!rec) return {};
      return rec as FileShape;
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
        return {};
      }
      return {};
    }
  }

  async function writeFileShape(shape: FileShape): Promise<void> {
    await mkdir(path.dirname(resolved), { recursive: true });
    const tmp = `${resolved}.${process.pid}.tmp`;
    await writeFile(tmp, `${JSON.stringify(shape, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(tmp, resolved);
    try {
      await chmod(resolved, 0o600);
    } catch {
      /* best-effort; Windows may ignore mode */
    }
  }

  return {
    async get(provider) {
      if (provider !== "google") return null;
      const shape = await readFileShape();
      return parseGoogleStoredTokens(shape.google);
    },
    async set(tokens) {
      const parsed = parseGoogleStoredTokens(tokens);
      if (!parsed) return;
      const shape = await readFileShape();
      shape.google = { ...parsed, updatedAt: new Date().toISOString() };
      await writeFileShape(shape);
    },
    async clear(provider) {
      if (provider !== "google") return;
      const shape = await readFileShape();
      delete shape.google;
      await writeFileShape(shape);
    },
  };
}

/** File store when `GOOGLE_CALENDAR_TOKEN_FILE` is set; otherwise in-memory. */
export function createTokenStoreFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TokenStore {
  const file = env.GOOGLE_CALENDAR_TOKEN_FILE?.trim();
  if (file) return createFileTokenStore(file);
  return createMemoryTokenStore();
}
