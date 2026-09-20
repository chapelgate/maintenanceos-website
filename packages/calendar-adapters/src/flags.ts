const TRUE = new Set(["true", "1"]);

export function isCalendarAdaptersEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.CALENDAR_ADAPTERS_ENABLED;
  return value !== undefined && TRUE.has(value);
}

export function calendarProviderFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): "mock" | "google" | "microsoft" {
  const raw = (env.CALENDAR_ADAPTER_PROVIDER ?? "mock").trim().toLowerCase();
  if (raw === "google" || raw === "microsoft") return raw;
  return "mock";
}
