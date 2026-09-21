import { createDisabledAdapter } from "./disabled.ts";
import { calendarProviderFromEnv, isCalendarAdaptersEnabled } from "./flags.ts";
import { createGoogleCalendarAdapter } from "./google.ts";
import { createMicrosoftCalendarAdapter } from "./microsoft.ts";
import { createMockCalendarAdapter } from "./mock.ts";
import { createTokenStoreFromEnv } from "./tokens.ts";
import type { AdapterDeps, CalendarAdapter } from "./types.ts";

export function createCalendarAdapter(deps: AdapterDeps = {}): CalendarAdapter {
  const env = deps.env ?? process.env;
  const enabled = deps.enabled ?? isCalendarAdaptersEnabled(env);
  const provider = calendarProviderFromEnv(env);
  if (!enabled) return createDisabledAdapter(provider);
  const tokenStore = deps.tokenStore ?? createTokenStoreFromEnv(env);
  if (provider === "google") {
    return createGoogleCalendarAdapter({ ...deps, env, tokenStore });
  }
  if (provider === "microsoft") {
    return createMicrosoftCalendarAdapter({ ...deps, env, tokenStore });
  }
  return createMockCalendarAdapter(deps);
}
