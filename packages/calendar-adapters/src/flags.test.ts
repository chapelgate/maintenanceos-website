import assert from "node:assert/strict";
import test from "node:test";
import { calendarProviderFromEnv, isCalendarAdaptersEnabled } from "./flags.ts";

test("CALENDAR_ADAPTERS_ENABLED is off by default", () => {
  assert.equal(isCalendarAdaptersEnabled({}), false);
  assert.equal(isCalendarAdaptersEnabled({ CALENDAR_ADAPTERS_ENABLED: "false" }), false);
  assert.equal(isCalendarAdaptersEnabled({ CALENDAR_ADAPTERS_ENABLED: "" }), false);
  assert.equal(isCalendarAdaptersEnabled({ CALENDAR_ADAPTERS_ENABLED: "true" }), true);
  assert.equal(isCalendarAdaptersEnabled({ CALENDAR_ADAPTERS_ENABLED: "1" }), true);
});

test("calendarProviderFromEnv defaults to mock", () => {
  assert.equal(calendarProviderFromEnv({}), "mock");
  assert.equal(calendarProviderFromEnv({ CALENDAR_ADAPTER_PROVIDER: "GOOGLE" }), "google");
  assert.equal(calendarProviderFromEnv({ CALENDAR_ADAPTER_PROVIDER: "microsoft" }), "microsoft");
  assert.equal(calendarProviderFromEnv({ CALENDAR_ADAPTER_PROVIDER: "other" }), "mock");
});
