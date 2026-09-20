import { createDisabledAdapter } from "./disabled.ts";
import { calendarProviderFromEnv, isCalendarAdaptersEnabled } from "./flags.ts";
import { createGoogleCalendarAdapter } from "./google.ts";
import { createMicrosoftCalendarAdapter } from "./microsoft.ts";
import { createMockCalendarAdapter } from "./mock.ts";
import type { AdapterDeps, CalendarAdapter } from "./types.ts";

export function createCalendarAdapter(deps: AdapterDeps = {}): CalendarAdapter {
  const env = deps.env ?? process.env;
  const enabled = deps.enabled ?? isCalendarAdaptersEnabled(env);
  const provider = calendarProviderFromEnv(env);
  if (!enabled) return createDisabledAdapter(provider);
  if (provider === "google") return createGoogleCalendarAdapter(deps);
  if (provider === "microsoft") return createMicrosoftCalendarAdapter(deps);
  return createMockCalendarAdapter(deps);
}
