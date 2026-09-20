import { calendarFailure, type CalendarResult, type FetchLike } from "./types.ts";

export type TokenExchangeInput = {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  scope?: string;
  fetch?: FetchLike;
};

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

  let res: Response;
  try {
    res = await fetchFn(input.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    });
  } catch {
    return calendarFailure(
      "auth_failed",
      "Could not reach the OAuth token endpoint. No booking was created.",
    );
  }

  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }
  const token =
    parsed && typeof parsed === "object"
      ? (parsed as { access_token?: unknown }).access_token
      : undefined;
  if (!res.ok || typeof token !== "string" || !token) {
    return calendarFailure(
      "auth_failed",
      "OAuth token exchange failed. Check refresh token and client credentials. No booking was created.",
    );
  }
  const expiresIn =
    parsed && typeof parsed === "object"
      ? (parsed as { expires_in?: unknown }).expires_in
      : undefined;
  return {
    ok: true,
    data: {
      accessToken: token,
      expiresIn: typeof expiresIn === "number" ? expiresIn : undefined,
    },
  };
}

/** Operator helper: open this URL, then exchange the code for a refresh token. */
export function googleAuthorizationUrl(
  clientId: string,
  redirectUri: string,
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

export function googleEnvCredentials(env: NodeJS.ProcessEnv): {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
} | null {
  const clientId = env.GOOGLE_CALENDAR_CLIENT_ID?.trim() ?? "";
  const clientSecret = env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim() ?? "";
  const refreshToken = env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim() ?? "";
  if (!clientId || !clientSecret || !refreshToken) return null;
  return {
    clientId,
    clientSecret,
    refreshToken,
    calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID?.trim() || "primary",
  };
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
