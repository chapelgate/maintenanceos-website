/**
 * Local token store for Google / Microsoft Calendar OAuth.
 * In-memory (process lifetime) or a gitignored file stub.
 * Never log token values. Hosted Render stays mock-only — do not put secrets there.
 */

import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type CalendarTokenProvider = "google" | "microsoft";

export type GoogleStoredTokens = {
  provider: "google";
  refreshToken: string;
  accessToken?: string;
  expiresAt?: number;
  calendarId?: string;
  updatedAt?: string;
};

export type MicrosoftStoredTokens = {
  provider: "microsoft";
  refreshToken: string;
  accessToken?: string;
  expiresAt?: number;
  tenant?: string;
  updatedAt?: string;
};

export type StoredTokens = GoogleStoredTokens | MicrosoftStoredTokens;

export type TokenStore = {
  get(provider: "google"): Promise<GoogleStoredTokens | null>;
  get(provider: "microsoft"): Promise<MicrosoftStoredTokens | null>;
  get(provider: CalendarTokenProvider): Promise<StoredTokens | null>;
  set(tokens: StoredTokens): Promise<void>;
  clear(provider: CalendarTokenProvider): Promise<void>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseSharedFields(rec: Record<string, unknown>): {
  refreshToken: string;
  accessToken?: string;
  expiresAt?: number;
  updatedAt?: string;
} | null {
  const refreshToken =
    typeof rec.refreshToken === "string" ? rec.refreshToken.trim() : "";
  if (!refreshToken) return null;
  const accessToken =
    typeof rec.accessToken === "string" && rec.accessToken.trim()
      ? rec.accessToken.trim()
      : undefined;
  const expiresAt = typeof rec.expiresAt === "number" ? rec.expiresAt : undefined;
  const updatedAt =
    typeof rec.updatedAt === "string" && rec.updatedAt.trim()
      ? rec.updatedAt.trim()
      : undefined;
  return { refreshToken, accessToken, expiresAt, updatedAt };
}

export function parseGoogleStoredTokens(value: unknown): GoogleStoredTokens | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const shared = parseSharedFields(rec);
  if (!shared) return null;
  const calendarId =
    typeof rec.calendarId === "string" && rec.calendarId.trim()
      ? rec.calendarId.trim()
      : undefined;
  return {
    provider: "google",
    ...shared,
    calendarId,
  };
}

export function parseMicrosoftStoredTokens(
  value: unknown,
): MicrosoftStoredTokens | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const shared = parseSharedFields(rec);
  if (!shared) return null;
  const tenant =
    typeof rec.tenant === "string" && rec.tenant.trim()
      ? rec.tenant.trim()
      : undefined;
  return {
    provider: "microsoft",
    ...shared,
    tenant,
  };
}

export function createMemoryTokenStore(
  initial: StoredTokens | null = null,
): TokenStore {
  let google: GoogleStoredTokens | null =
    initial?.provider === "google" ? parseGoogleStoredTokens(initial) : null;
  let microsoft: MicrosoftStoredTokens | null =
    initial?.provider === "microsoft" ? parseMicrosoftStoredTokens(initial) : null;
  return {
    async get(provider) {
      if (provider === "microsoft") return microsoft;
      return google;
    },
    async set(tokens) {
      if (tokens.provider === "microsoft") {
        const parsed = parseMicrosoftStoredTokens(tokens);
        if (!parsed) return;
        microsoft = { ...parsed, updatedAt: new Date().toISOString() };
        return;
      }
      const parsed = parseGoogleStoredTokens(tokens);
      if (!parsed) return;
      google = { ...parsed, updatedAt: new Date().toISOString() };
    },
    async clear(provider) {
      if (provider === "microsoft") microsoft = null;
      else google = null;
    },
  };
}

type FileShape = {
  google?: Record<string, unknown>;
  microsoft?: Record<string, unknown>;
};

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
      const shape = await readFileShape();
      if (provider === "microsoft") return parseMicrosoftStoredTokens(shape.microsoft);
      return parseGoogleStoredTokens(shape.google);
    },
    async set(tokens) {
      if (tokens.provider === "microsoft") {
        const parsed = parseMicrosoftStoredTokens(tokens);
        if (!parsed) return;
        const shape = await readFileShape();
        shape.microsoft = { ...parsed, updatedAt: new Date().toISOString() };
        await writeFileShape(shape);
        return;
      }
      const parsed = parseGoogleStoredTokens(tokens);
      if (!parsed) return;
      const shape = await readFileShape();
      shape.google = { ...parsed, updatedAt: new Date().toISOString() };
      await writeFileShape(shape);
    },
    async clear(provider) {
      const shape = await readFileShape();
      if (provider === "microsoft") delete shape.microsoft;
      else delete shape.google;
      await writeFileShape(shape);
    },
  };
}

function createCompositeTokenStore(
  googleStore: TokenStore,
  microsoftStore: TokenStore,
): TokenStore {
  return {
    async get(provider) {
      return provider === "microsoft"
        ? microsoftStore.get("microsoft")
        : googleStore.get("google");
    },
    async set(tokens) {
      if (tokens.provider === "microsoft") return microsoftStore.set(tokens);
      return googleStore.set(tokens);
    },
    async clear(provider) {
      if (provider === "microsoft") return microsoftStore.clear("microsoft");
      return googleStore.clear("google");
    },
  };
}

/**
 * File store when a token-file env is set; otherwise in-memory.
 * `GOOGLE_CALENDAR_TOKEN_FILE` and `MICROSOFT_CALENDAR_TOKEN_FILE` may point at
 * the same gitignored file (both providers) or different files.
 */
export function createTokenStoreFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TokenStore {
  const googleFile = env.GOOGLE_CALENDAR_TOKEN_FILE?.trim();
  const microsoftFile = env.MICROSOFT_CALENDAR_TOKEN_FILE?.trim();
  if (!googleFile && !microsoftFile) return createMemoryTokenStore();
  if (
    googleFile &&
    microsoftFile &&
    path.resolve(googleFile) !== path.resolve(microsoftFile)
  ) {
    return createCompositeTokenStore(
      createFileTokenStore(googleFile),
      createFileTokenStore(microsoftFile),
    );
  }
  return createFileTokenStore(googleFile || microsoftFile || "");
}
