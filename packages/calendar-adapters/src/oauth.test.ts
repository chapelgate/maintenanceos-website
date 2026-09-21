import assert from "node:assert/strict";
import test from "node:test";
import {
  createMemoryOauthStateStore,
  exchangeAuthorizationCode,
  googleAuthorizationUrl,
  googleClientFromEnv,
  googleRedirectUriFromEnv,
  microsoftAuthorizationUrl,
  microsoftClientFromEnv,
  microsoftRedirectUriFromEnv,
  resolveGoogleCredentials,
  resolveMicrosoftCredentials,
} from "./oauth.ts";
import {
  handleGoogleOAuthCallback,
  handleGoogleOAuthStart,
  handleMicrosoftOAuthCallback,
  handleMicrosoftOAuthStart,
} from "./oauth-http.ts";
import { createMemoryTokenStore } from "./tokens.ts";

test("googleAuthorizationUrl includes state, offline access, and callback path", () => {
  const url = googleAuthorizationUrl("cid", "http://127.0.0.1:8789/oauth/google/callback", {
    state: "abc",
  });
  assert.match(url, /accounts\.google\.com/);
  assert.match(url, /access_type=offline/);
  assert.match(url, /calendar\.events/);
  assert.match(url, /state=abc/);
  assert.match(url, /oauth%2Fgoogle%2Fcallback/);
});

test("googleRedirectUriFromEnv defaults to loopback callback", () => {
  assert.equal(
    googleRedirectUriFromEnv({}),
    "http://127.0.0.1:8789/oauth/google/callback",
  );
  assert.equal(
    googleRedirectUriFromEnv({ CALENDAR_ADAPTERS_PORT: "8799" }),
    "http://127.0.0.1:8799/oauth/google/callback",
  );
  assert.equal(
    googleRedirectUriFromEnv({ GOOGLE_CALENDAR_REDIRECT_URI: "http://127.0.0.1:9/cb" }),
    "http://127.0.0.1:9/cb",
  );
});

test("googleClientFromEnv is null without client id/secret", () => {
  assert.equal(googleClientFromEnv({}), null);
  assert.equal(
    googleClientFromEnv({ GOOGLE_CALENDAR_CLIENT_ID: "cid" }),
    null,
  );
  const client = googleClientFromEnv({
    GOOGLE_CALENDAR_CLIENT_ID: "cid",
    GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
  });
  assert.equal(client?.clientId, "cid");
  assert.equal(client?.calendarId, "primary");
});

test("resolveGoogleCredentials prefers env refresh then token store", async () => {
  const store = createMemoryTokenStore({
    provider: "google",
    refreshToken: "stored",
    calendarId: "stored-cal",
  });
  assert.equal(await resolveGoogleCredentials({}, store), null);
  const fromStore = await resolveGoogleCredentials(
    {
      GOOGLE_CALENDAR_CLIENT_ID: "cid",
      GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
    },
    store,
  );
  assert.equal(fromStore?.refreshToken, "stored");
  assert.equal(fromStore?.calendarId, "stored-cal");
  const fromEnv = await resolveGoogleCredentials(
    {
      GOOGLE_CALENDAR_CLIENT_ID: "cid",
      GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
      GOOGLE_CALENDAR_REFRESH_TOKEN: "env-rt",
      GOOGLE_CALENDAR_CALENDAR_ID: "primary",
    },
    store,
  );
  assert.equal(fromEnv?.refreshToken, "env-rt");
  assert.equal(fromEnv?.calendarId, "primary");
});

test("exchangeAuthorizationCode requires a refresh_token", async () => {
  const fetchFn: typeof fetch = async () =>
    new Response(JSON.stringify({ access_token: "only-access" }), { status: 200 });
  const failed = await exchangeAuthorizationCode({
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: "cid",
    clientSecret: "sec",
    code: "code-1",
    redirectUri: "http://127.0.0.1:8789/oauth/google/callback",
    fetch: fetchFn,
  });
  assert.equal(failed.ok, false);
  if (!failed.ok) {
    assert.equal(failed.error, "auth_failed");
    assert.match(failed.message, /No token was stored/);
  }

  const okFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        access_token: "at",
        refresh_token: "rt",
        expires_in: 3600,
      }),
      { status: 200 },
    );
  const ok = await exchangeAuthorizationCode({
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: "cid",
    clientSecret: "sec",
    code: "code-2",
    redirectUri: "http://127.0.0.1:8789/oauth/google/callback",
    fetch: okFetch,
  });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.data.refreshToken, "rt");
    assert.equal(ok.data.accessToken, "at");
  }
});

test("oauth state store rejects reuse", () => {
  const store = createMemoryOauthStateStore();
  const state = store.issue();
  assert.equal(store.consume(state), true);
  assert.equal(store.consume(state), false);
  assert.equal(store.consume("nope"), false);
});

test("oauth start is 503 when disabled or not configured", () => {
  const store = createMemoryTokenStore();
  const disabled = handleGoogleOAuthStart({
    adaptersEnabled: false,
    env: {
      GOOGLE_CALENDAR_CLIENT_ID: "cid",
      GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
    },
    tokenStore: store,
  });
  assert.equal(disabled.status, 503);
  assert.match(disabled.body, /calendar_disabled/);

  const missing = handleGoogleOAuthStart({
    adaptersEnabled: true,
    env: {},
    tokenStore: store,
  });
  assert.equal(missing.status, 503);
  assert.match(missing.body, /not_configured/);
});

test("oauth start redirects to Google with CSRF state", () => {
  const stateStore = createMemoryOauthStateStore();
  const result = handleGoogleOAuthStart({
    adaptersEnabled: true,
    env: {
      GOOGLE_CALENDAR_CLIENT_ID: "cid",
      GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
    },
    tokenStore: createMemoryTokenStore(),
    oauthStateStore: stateStore,
  });
  assert.equal(result.status, 302);
  const location = result.headers.Location;
  assert.ok(location);
  assert.match(location, /accounts\.google\.com/);
  const url = new URL(location);
  const state = url.searchParams.get("state");
  assert.ok(state);
  assert.equal(stateStore.consume(state), true);
});

test("microsoftAuthorizationUrl includes state, consent, and callback path", () => {
  const url = microsoftAuthorizationUrl(
    "cid",
    "http://127.0.0.1:8789/oauth/microsoft/callback",
    { state: "abc", tenant: "common" },
  );
  assert.match(url, /login\.microsoftonline\.com\/common/);
  assert.match(url, /Calendars\.ReadWrite/);
  assert.match(url, /offline_access/);
  assert.match(url, /prompt=consent/);
  assert.match(url, /state=abc/);
  assert.match(url, /oauth%2Fmicrosoft%2Fcallback/);
});

test("microsoftRedirectUriFromEnv defaults to loopback callback", () => {
  assert.equal(
    microsoftRedirectUriFromEnv({}),
    "http://127.0.0.1:8789/oauth/microsoft/callback",
  );
  assert.equal(
    microsoftRedirectUriFromEnv({ CALENDAR_ADAPTERS_PORT: "8799" }),
    "http://127.0.0.1:8799/oauth/microsoft/callback",
  );
  assert.equal(
    microsoftRedirectUriFromEnv({
      MICROSOFT_CALENDAR_REDIRECT_URI: "http://127.0.0.1:9/cb",
    }),
    "http://127.0.0.1:9/cb",
  );
});

test("microsoftClientFromEnv is null without client id/secret", () => {
  assert.equal(microsoftClientFromEnv({}), null);
  assert.equal(
    microsoftClientFromEnv({ MICROSOFT_CALENDAR_CLIENT_ID: "cid" }),
    null,
  );
  const client = microsoftClientFromEnv({
    MICROSOFT_CALENDAR_CLIENT_ID: "cid",
    MICROSOFT_CALENDAR_CLIENT_SECRET: "sec",
  });
  assert.equal(client?.clientId, "cid");
  assert.equal(client?.tenant, "common");
});

test("resolveMicrosoftCredentials prefers env refresh then token store", async () => {
  const store = createMemoryTokenStore({
    provider: "microsoft",
    refreshToken: "stored",
    tenant: "contoso",
  });
  assert.equal(await resolveMicrosoftCredentials({}, store), null);
  const fromStore = await resolveMicrosoftCredentials(
    {
      MICROSOFT_CALENDAR_CLIENT_ID: "cid",
      MICROSOFT_CALENDAR_CLIENT_SECRET: "sec",
    },
    store,
  );
  assert.equal(fromStore?.refreshToken, "stored");
  assert.equal(fromStore?.tenant, "contoso");
  const fromEnv = await resolveMicrosoftCredentials(
    {
      MICROSOFT_CALENDAR_CLIENT_ID: "cid",
      MICROSOFT_CALENDAR_CLIENT_SECRET: "sec",
      MICROSOFT_CALENDAR_REFRESH_TOKEN: "env-rt",
      MICROSOFT_CALENDAR_TENANT_ID: "common",
    },
    store,
  );
  assert.equal(fromEnv?.refreshToken, "env-rt");
  assert.equal(fromEnv?.tenant, "common");
});

test("microsoft oauth start is 503 when disabled or not configured", () => {
  const store = createMemoryTokenStore();
  const disabled = handleMicrosoftOAuthStart({
    adaptersEnabled: false,
    env: {
      MICROSOFT_CALENDAR_CLIENT_ID: "cid",
      MICROSOFT_CALENDAR_CLIENT_SECRET: "sec",
    },
    tokenStore: store,
  });
  assert.equal(disabled.status, 503);
  assert.match(disabled.body, /calendar_disabled/);

  const missing = handleMicrosoftOAuthStart({
    adaptersEnabled: true,
    env: {},
    tokenStore: store,
  });
  assert.equal(missing.status, 503);
  assert.match(missing.body, /not_configured/);
});

test("microsoft oauth start redirects to Microsoft with CSRF state", () => {
  const stateStore = createMemoryOauthStateStore();
  const result = handleMicrosoftOAuthStart({
    adaptersEnabled: true,
    env: {
      MICROSOFT_CALENDAR_CLIENT_ID: "cid",
      MICROSOFT_CALENDAR_CLIENT_SECRET: "sec",
    },
    tokenStore: createMemoryTokenStore(),
    oauthStateStore: stateStore,
  });
  assert.equal(result.status, 302);
  const location = result.headers.Location;
  assert.ok(location);
  assert.match(location, /login\.microsoftonline\.com/);
  const url = new URL(location);
  const state = url.searchParams.get("state");
  assert.ok(state);
  assert.equal(stateStore.consume(state), true);
});

test("microsoft oauth callback stores refresh token and refuses reused state", async () => {
  const stateStore = createMemoryOauthStateStore();
  const tokenStore = createMemoryTokenStore();
  const env = {
    MICROSOFT_CALENDAR_CLIENT_ID: "cid",
    MICROSOFT_CALENDAR_CLIENT_SECRET: "sec",
  };
  const state = stateStore.issue();
  const fetchFn: typeof fetch = async () =>
    new Response(
      JSON.stringify({ access_token: "at", refresh_token: "rt-ms", expires_in: 3600 }),
      { status: 200 },
    );
  const ok = await handleMicrosoftOAuthCallback(
    `/oauth/microsoft/callback?code=abc&state=${state}`,
    {
      adaptersEnabled: true,
      env,
      tokenStore,
      oauthStateStore: stateStore,
      fetch: fetchFn,
    },
  );
  assert.equal(ok.status, 200);
  assert.match(ok.body, /token stored locally/i);
  assert.match(ok.body, /not a live Microsoft 365 Calendar product on staging/i);
  assert.equal((await tokenStore.get("microsoft"))?.refreshToken, "rt-ms");

  const reused = await handleMicrosoftOAuthCallback(
    `/oauth/microsoft/callback?code=abc&state=${state}`,
    {
      adaptersEnabled: true,
      env,
      tokenStore,
      oauthStateStore: stateStore,
      fetch: fetchFn,
    },
  );
  assert.equal(reused.status, 400);
  assert.match(reused.body, /invalid state/i);
});

test("oauth callback stores refresh token from Google and refuses missing refresh", async () => {
  const stateStore = createMemoryOauthStateStore();
  const tokenStore = createMemoryTokenStore();
  const env = {
    GOOGLE_CALENDAR_CLIENT_ID: "cid",
    GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
  };
  const state = stateStore.issue();
  const fetchFn: typeof fetch = async () =>
    new Response(
      JSON.stringify({ access_token: "at", refresh_token: "rt-live", expires_in: 3600 }),
      { status: 200 },
    );
  const ok = await handleGoogleOAuthCallback(
    `/oauth/google/callback?code=abc&state=${state}`,
    {
      adaptersEnabled: true,
      env,
      tokenStore,
      oauthStateStore: stateStore,
      fetch: fetchFn,
    },
  );
  assert.equal(ok.status, 200);
  assert.match(ok.body, /token stored locally/i);
  assert.match(ok.body, /not a live Google Calendar product on staging/i);
  assert.equal((await tokenStore.get("google"))?.refreshToken, "rt-live");

  const reused = await handleGoogleOAuthCallback(
    `/oauth/google/callback?code=abc&state=${state}`,
    {
      adaptersEnabled: true,
      env,
      tokenStore,
      oauthStateStore: stateStore,
      fetch: fetchFn,
    },
  );
  assert.equal(reused.status, 400);
  assert.match(reused.body, /invalid state/i);
});
