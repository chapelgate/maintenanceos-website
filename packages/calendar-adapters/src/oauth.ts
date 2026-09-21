import { randomBytes } from "node:crypto";
import type { TokenStore } from "./tokens.ts";
import { calendarFailure, type CalendarResult, type FetchLike } from "./types.ts";

export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_OAUTH_START_PATH = "/oauth/google/start";
export const GOOGLE_OAUTH_CALLBACK_PATH = "/oauth/google/callback";
export const DEFAULT_GOOGLE_OAUTH_CALLBACK =
  "http://127.0.0.1:8789/oauth/google/callback";

export type TokenExchangeInput = {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  scope?: string;
  fetch?: FetchLike;
};

export type AuthorizationCodeExchangeInput = {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  fetch?: FetchLike;
};

export type GoogleClientConfig = {
  clientId: string;
  clientSecret: string;
  calendarId: string;
  redirectUri: string;
};

export type GoogleCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
};

export type OauthStateStore = {
  issue(): string;
  consume(state: string): boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

async function postTokenForm(
  fetchFn: FetchLike,
  tokenUrl: string,
  body: URLSearchParams,
): Promise<{ ok: boolean; parsed: Record<string, unknown> | null } | { network: true }> {
  let res: Response;
  try {
    res = await fetchFn(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    });
  } catch {
    return { network: true };
  }
  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }
  return { ok: res.ok, parsed: asRecord(parsed) };
}

export async function exchangeRefreshToken(
  input: TokenExchangeInput,
): Promise<CalendarResult<{ accessToken: string; expiresIn?: number }>> {
  const fetchFn = input.fetch ?? fetch;
  const body = new URLSearchParams({
    client_id: input.clientId,
    client_secret: input.clientSecret,
    refresh_token: input.refreshToken,
    grant_type: "refresh_token",
  });
  if (input.scope) body.set("scope", input.scope);

  const result = await postTokenForm(fetchFn, input.tokenUrl, body);
  if ("network" in result) {
    return calendarFailure(
      "auth_failed",
      "Could not reach the OAuth token endpoint. No booking was created.",
    );
  }
  const token = result.parsed?.access_token;
  if (!result.ok || typeof token !== "string" || !token) {
    return calendarFailure(
      "auth_failed",
      "OAuth token exchange failed. Check refresh token and client credentials. No booking was created.",
    );
  }
  const expiresIn = result.parsed?.expires_in;
  return {
    ok: true,
    data: {
      accessToken: token,
      expiresIn: typeof expiresIn === "number" ? expiresIn : undefined,
    },
  };
}

/**
 * Exchange an authorization code for tokens.
 * Google only returns `refresh_token` on the first consent (`prompt=consent`).
 * Missing refresh token → `auth_failed`. Tokens are not logged.
 */
export async function exchangeAuthorizationCode(
  input: AuthorizationCodeExchangeInput,
): Promise<
  CalendarResult<{ accessToken: string; refreshToken: string; expiresIn?: number }>
> {
  const code = input.code.trim();
  if (!code) {
    return calendarFailure(
      "auth_failed",
      "OAuth authorization code is empty. No token was stored. No booking was created.",
    );
  }
  const fetchFn = input.fetch ?? fetch;
  const body = new URLSearchParams({
    client_id: input.clientId,
    client_secret: input.clientSecret,
    code,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
  });
  const result = await postTokenForm(fetchFn, input.tokenUrl, body);
  if ("network" in result) {
    return calendarFailure(
      "auth_failed",
      "Could not reach the OAuth token endpoint. No token was stored. No booking was created.",
    );
  }
  const accessToken = result.parsed?.access_token;
  const refreshToken = result.parsed?.refresh_token;
  if (
    !result.ok ||
    typeof accessToken !== "string" ||
    !accessToken ||
    typeof refreshToken !== "string" ||
    !refreshToken
  ) {
    return calendarFailure(
      "auth_failed",
      "OAuth authorization-code exchange did not return a refresh token. No token was stored. No booking was created.",
    );
  }
  const expiresIn = result.parsed?.expires_in;
  return {
    ok: true,
    data: {
      accessToken,
      refreshToken,
      expiresIn: typeof expiresIn === "number" ? expiresIn : undefined,
    },
  };
}

/** Loopback callback unless `GOOGLE_CALENDAR_REDIRECT_URI` is set. */
export function googleRedirectUriFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const explicit = env.GOOGLE_CALENDAR_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const port = env.CALENDAR_ADAPTERS_PORT?.trim() || "8789";
  return `http://127.0.0.1:${port}${GOOGLE_OAUTH_CALLBACK_PATH}`;
}

/** Operator helper: open this URL (or GET `/oauth/google/start` on the companion). */
export function googleAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  options?: { state?: string },
): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
  );
  if (options?.state) url.searchParams.set("state", options.state);
  return url.toString();
}

/** Operator helper: Microsoft identity authorize URL (Calendars.ReadWrite + offline_access). */
export function microsoftAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  tenant = "common",
): string {
  const url = new URL(
    `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/authorize`,
  );
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", "offline_access Calendars.ReadWrite");
  return url.toString();
}

export function googleClientFromEnv(
  env: NodeJS.ProcessEnv,
): GoogleClientConfig | null {
  const clientId = env.GOOGLE_CALENDAR_CLIENT_ID?.trim() ?? "";
  const clientSecret = env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim() ?? "";
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID?.trim() || "primary",
    redirectUri: googleRedirectUriFromEnv(env),
  };
}

/** Env-only credentials (client + refresh token). Store tokens are resolved separately. */
export function googleEnvCredentials(env: NodeJS.ProcessEnv): GoogleCredentials | null {
  const client = googleClientFromEnv(env);
  const refreshToken = env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim() ?? "";
  if (!client || !refreshToken) return null;
  return {
    clientId: client.clientId,
    clientSecret: client.clientSecret,
    refreshToken,
    calendarId: client.calendarId,
  };
}

/**
 * Client id/secret from env; refresh token from env **or** the local token store.
 * Missing either side → null (`not_configured`). Does not invent tokens.
 */
export async function resolveGoogleCredentials(
  env: NodeJS.ProcessEnv,
  store?: TokenStore,
): Promise<GoogleCredentials | null> {
  const client = googleClientFromEnv(env);
  if (!client) return null;
  const fromEnv = env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim() ?? "";
  if (fromEnv) {
    return {
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      refreshToken: fromEnv,
      calendarId: client.calendarId,
    };
  }
  const stored = store ? await store.get("google") : null;
  const refreshToken = stored?.refreshToken?.trim() ?? "";
  if (!refreshToken) return null;
  return {
    clientId: client.clientId,
    clientSecret: client.clientSecret,
    refreshToken,
    calendarId: stored?.calendarId?.trim() || client.calendarId,
  };
}

export async function googleOAuthStatus(
  env: NodeJS.ProcessEnv,
  store?: TokenStore,
): Promise<{ clientConfigured: boolean; tokenPresent: boolean }> {
  const clientConfigured = googleClientFromEnv(env) !== null;
  const creds = await resolveGoogleCredentials(env, store);
  return { clientConfigured, tokenPresent: Boolean(creds) };
}

export function microsoftEnvCredentials(env: NodeJS.ProcessEnv): {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  tenant: string;
} | null {
  const clientId = env.MICROSOFT_CALENDAR_CLIENT_ID?.trim() ?? "";
  const clientSecret = env.MICROSOFT_CALENDAR_CLIENT_SECRET?.trim() ?? "";
  const refreshToken = env.MICROSOFT_CALENDAR_REFRESH_TOKEN?.trim() ?? "";
  if (!clientId || !clientSecret || !refreshToken) return null;
  return {
    clientId,
    clientSecret,
    refreshToken,
    tenant: env.MICROSOFT_CALENDAR_TENANT_ID?.trim() || "common",
  };
}

const DEFAULT_STATE_TTL_MS = 10 * 60 * 1000;

export function createMemoryOauthStateStore(
  ttlMs = DEFAULT_STATE_TTL_MS,
  now: () => number = () => Date.now(),
): OauthStateStore {
  const issued = new Map<string, number>();
  return {
    issue() {
      const state = randomBytes(24).toString("hex");
      issued.set(state, now());
      return state;
    },
    consume(state: string) {
      const trimmed = state.trim();
      if (!trimmed) return false;
      const created = issued.get(trimmed);
      issued.delete(trimmed);
      if (created === undefined) return false;
      return now() - created <= ttlMs;
    },
  };
}
