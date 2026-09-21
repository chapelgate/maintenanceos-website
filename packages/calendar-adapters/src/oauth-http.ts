/**
 * Loopback Google OAuth start / callback for the calendar companion.
 * Not a Next.js route. Staging hosted path stays mock-only — do not claim
 * Google Calendar is live on DigitalOcean / Render.
 */

import {
  GOOGLE_OAUTH_CALLBACK_PATH,
  GOOGLE_OAUTH_START_PATH,
  GOOGLE_TOKEN_URL,
  createMemoryOauthStateStore,
  exchangeAuthorizationCode,
  googleAuthorizationUrl,
  googleClientFromEnv,
  type OauthStateStore,
} from "./oauth.ts";
import type { TokenStore } from "./tokens.ts";
import type { FetchLike } from "./types.ts";

export { GOOGLE_OAUTH_CALLBACK_PATH, GOOGLE_OAUTH_START_PATH };

const defaultStateStore = createMemoryOauthStateStore();

function stateStoreOf(options: GoogleOauthHandlerOptions): OauthStateStore {
  return options.oauthStateStore ?? defaultStateStore;
}

export type OauthHttpResult = {
  status: number;
  headers: Record<string, string>;
  body: string;
};

export type GoogleOauthHandlerOptions = {
  adaptersEnabled: boolean;
  env: NodeJS.ProcessEnv;
  tokenStore: TokenStore;
  oauthStateStore?: OauthStateStore;
  fetch?: FetchLike;
  extraHeaders?: Record<string, string>;
};

function jsonResult(
  status: number,
  payload: unknown,
  extraHeaders: Record<string, string> = {},
): OauthHttpResult {
  return {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  };
}

function htmlResult(
  status: number,
  title: string,
  paragraphs: string[],
  extraHeaders: Record<string, string> = {},
): OauthHttpResult {
  const items = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body><h1>${escapeHtml(title)}</h1>${items}</body></html>`,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

const DISABLED = {
  ok: false as const,
  error: "calendar_disabled",
  message:
    "Calendar adapters are disabled. Set CALENDAR_ADAPTERS_ENABLED=true to enable. No token was stored. No booking was created.",
};

const NOT_CONFIGURED = {
  ok: false as const,
  error: "not_configured",
  message:
    "Google Calendar OAuth client env is not set (GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET). Register http://127.0.0.1:8789/oauth/google/callback as the redirect URI. No token was stored. No booking was created.",
};

export function handleGoogleOAuthStart(
  options: GoogleOauthHandlerOptions,
): OauthHttpResult {
  const extra = options.extraHeaders ?? {};
  if (!options.adaptersEnabled) {
    return jsonResult(503, DISABLED, extra);
  }
  const client = googleClientFromEnv(options.env);
  if (!client) {
    return jsonResult(503, NOT_CONFIGURED, extra);
  }
  const state = stateStoreOf(options).issue();
  const location = googleAuthorizationUrl(client.clientId, client.redirectUri, {
    state,
  });
  return {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      ...extra,
    },
    body: "",
  };
}

export async function handleGoogleOAuthCallback(
  requestUrl: string,
  options: GoogleOauthHandlerOptions,
): Promise<OauthHttpResult> {
  const extra = options.extraHeaders ?? {};
  if (!options.adaptersEnabled) {
    return htmlResult(503, "Google Calendar OAuth — disabled", [
      DISABLED.message,
      "This is not a live Google Calendar product on staging.",
    ], extra);
  }
  const client = googleClientFromEnv(options.env);
  if (!client) {
    return htmlResult(503, "Google Calendar OAuth — not configured", [
      NOT_CONFIGURED.message,
      "This is not a live Google Calendar product on staging.",
    ], extra);
  }

  let url: URL;
  try {
    url = new URL(requestUrl, "http://127.0.0.1");
  } catch {
    return htmlResult(400, "Google Calendar OAuth — invalid request", [
      "The callback URL could not be parsed. No token was stored. No booking was created.",
    ], extra);
  }

  const oauthError = url.searchParams.get("error")?.trim() ?? "";
  if (oauthError) {
    return htmlResult(400, "Google Calendar OAuth — declined", [
      "Google did not grant calendar access. No token was stored. No booking was created.",
      "This companion does not claim Google Calendar is live on staging.",
    ], extra);
  }

  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code") ?? "";
  if (!stateStoreOf(options).consume(state)) {
    return htmlResult(400, "Google Calendar OAuth — invalid state", [
      "OAuth state was missing, reused, or expired. Start again from /oauth/google/start. No token was stored. No booking was created.",
    ], extra);
  }
  if (!code.trim()) {
    return htmlResult(400, "Google Calendar OAuth — missing code", [
      "Google did not return an authorization code. No token was stored. No booking was created.",
    ], extra);
  }

  const tokens = await exchangeAuthorizationCode({
    tokenUrl: GOOGLE_TOKEN_URL,
    clientId: client.clientId,
    clientSecret: client.clientSecret,
    code,
    redirectUri: client.redirectUri,
    fetch: options.fetch,
  });
  if (!tokens.ok) {
    return htmlResult(503, "Google Calendar OAuth — token exchange failed", [
      tokens.message,
      "listFreeSlots / createBooking stay not_configured until a refresh token is stored. This is not a live staging booking.",
    ], extra);
  }

  const expiresAt =
    typeof tokens.data.expiresIn === "number"
      ? Date.now() + tokens.data.expiresIn * 1000
      : undefined;
  await options.tokenStore.set({
    provider: "google",
    refreshToken: tokens.data.refreshToken,
    accessToken: tokens.data.accessToken,
    expiresAt,
    calendarId: client.calendarId,
  });

  return htmlResult(200, "Google Calendar OAuth — token stored locally", [
    "A refresh token is stored in this companion’s local token store (memory, or GOOGLE_CALENDAR_TOKEN_FILE). It is not in git.",
    "Set CALENDAR_ADAPTER_PROVIDER=google on this process for listFreeSlots / createBooking to call Google Calendar API v3.",
    "This is local adapter testing. It is not a live Google Calendar product on staging, not a phone booking, and not frozen telephony.",
  ], extra);
}
