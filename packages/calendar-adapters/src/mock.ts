import {
  calendarFailure,
  calendarSuccess,
  type AdapterDeps,
  type Booking,
  type BookingRequest,
  type CalendarAdapter,
  type CalendarResult,
  type CancelBookingInput,
  type FreeSlot,
  type ListSlotsInput,
  type RescheduleBookingInput,
} from "./types.ts";
import { computeFreeSlots, overlaps, parseInstant, validateRange } from "./slots.ts";

const DEFAULT_TITLE = "MaintenanceOS adapter test";

export function createMockCalendarAdapter(deps: AdapterDeps = {}): CalendarAdapter {
  const bookings = new Map<string, Booking>();
  let seq = 0;
  const now = () => deps.now?.() ?? new Date();

  function busyIntervals(): { start: Date; end: Date }[] {
    return [...bookings.values()]
      .filter((booking) => booking.status === "confirmed")
      .map((booking) => ({
        start: new Date(booking.start),
        end: new Date(booking.end),
      }));
  }

  return {
    provider: "mock",

    async listFreeSlots(input: ListSlotsInput): Promise<CalendarResult<FreeSlot[]>> {
      const range = validateRange(input.from, input.to);
      if (!range.ok) {
        return calendarFailure(
          "invalid_range",
          "from/to must be valid ISO-8601 instants and to must be after from.",
        );
      }
      return calendarSuccess(
        computeFreeSlots({
          from: range.from,
          to: range.to,
          busy: busyIntervals(),
          slotMinutes: input.durationMinutes,
          timezone: input.timezone,
          now: now(),
        }),
      );
    },

    async createBooking(input: BookingRequest): Promise<CalendarResult<Booking>> {
      const start = parseInstant(input.start);
      const end = parseInstant(input.end);
      if (!start || !end || end <= start) {
        return calendarFailure(
          "invalid_request",
          "Booking start/end must be valid ISO-8601 instants. No booking was created.",
        );
      }
      if (busyIntervals().some((block) => overlaps(start, end, block.start, block.end))) {
        return calendarFailure(
          "slot_unavailable",
          "That slot is not free in the mock adapter. No booking was created.",
        );
      }
      seq += 1;
      const booking: Booking = {
        id: `mock_booking_${seq}`,
        provider: "mock",
        start: start.toISOString(),
        end: end.toISOString(),
        timezone: input.timezone || "Europe/London",
        title: input.title?.trim() || DEFAULT_TITLE,
        status: "confirmed",
      };
      bookings.set(booking.id, booking);
      return calendarSuccess(booking);
    },

    async cancelBooking(input: CancelBookingInput): Promise<CalendarResult<Booking>> {
      const existing = bookings.get(input.id);
      if (!existing || existing.status === "cancelled") {
        return calendarFailure(
          "booking_not_found",
          "No mock booking exists for that id. Nothing was cancelled.",
        );
      }
      const cancelled: Booking = { ...existing, status: "cancelled" };
      bookings.set(existing.id, cancelled);
      return calendarSuccess(cancelled);
    },

    async rescheduleBooking(
      input: RescheduleBookingInput,
    ): Promise<CalendarResult<Booking>> {
      const existing = bookings.get(input.id);
      if (!existing || existing.status === "cancelled") {
        return calendarFailure(
          "booking_not_found",
          "No mock booking exists for that id. Nothing was rescheduled.",
        );
      }
      const start = parseInstant(input.start);
      const end = parseInstant(input.end);
      if (!start || !end || end <= start) {
        return calendarFailure(
          "invalid_request",
          "Reschedule start/end must be valid ISO-8601 instants. Booking was left unchanged.",
        );
      }
      const conflict = busyIntervals().some(
        (block) =>
          !(
            block.start.getTime() === new Date(existing.start).getTime() &&
            block.end.getTime() === new Date(existing.end).getTime()
          ) && overlaps(start, end, block.start, block.end),
      );
      if (conflict) {
        return calendarFailure(
          "slot_unavailable",
          "The new slot is not free in the mock adapter. Booking was left unchanged.",
        );
      }
      const moved: Booking = {
        ...existing,
        start: start.toISOString(),
        end: end.toISOString(),
        timezone: input.timezone || existing.timezone,
      };
      bookings.set(existing.id, moved);
      return calendarSuccess(moved);
    },
  };
}
