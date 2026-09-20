import {
  calendarFailure,
  type CalendarAdapter,
  type CalendarProviderId,
} from "./types.ts";

const DISABLED_MESSAGE =
  "Calendar adapters are disabled. Set CALENDAR_ADAPTERS_ENABLED=true to enable. No booking was created.";

export function createDisabledAdapter(
  provider: CalendarProviderId = "mock",
): CalendarAdapter {
  return {
    provider,
    async listFreeSlots() {
      return calendarFailure("calendar_disabled", DISABLED_MESSAGE);
    },
    async createBooking() {
      return calendarFailure("calendar_disabled", DISABLED_MESSAGE);
    },
    async cancelBooking() {
      return calendarFailure("calendar_disabled", DISABLED_MESSAGE);
    },
    async rescheduleBooking() {
      return calendarFailure("calendar_disabled", DISABLED_MESSAGE);
    },
  };
}
