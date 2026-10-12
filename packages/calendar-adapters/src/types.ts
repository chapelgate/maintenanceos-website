/**
 * Provider-agnostic calendar adapter types for MaintenanceOS.
 * Adapters must not invent bookings: ok:true only after a real provider/mock confirm.
 */

import type { TokenStore } from "./tokens.ts";

export const CALENDAR_PROVIDERS = ["mock", "google", "microsoft"] as const;
export type CalendarProviderId = (typeof CALENDAR_PROVIDERS)[number];

export type CalendarErrorCode =
  | "calendar_disabled"
  | "not_configured"
  | "auth_failed"
  | "invalid_range"
  | "slot_unavailable"
  | "booking_not_found"
  | "provider_error"
  | "invalid_request";

export type CalendarFailure = {
  ok: false;
  error: CalendarErrorCode;
  message: string;
};

export type CalendarSuccess<T> = {
  ok: true;
  data: T;
};

export type CalendarResult<T> = CalendarSuccess<T> | CalendarFailure;

export type FreeSlot = {
  start: string;
  end: string;
  timezone: string;
};

export type ListSlotsInput = {
  from: string;
  to: string;
  timezone?: string;
  durationMinutes?: number;
};

export type BookingRequest = {
  start: string;
  end: string;
  timezone?: string;
  title?: string;
  attendeeEmail?: string;
  notes?: string;
};

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  provider: CalendarProviderId;
  start: string;
  end: string;
  timezone: string;
  title: string;
  status: BookingStatus;
};

export type CancelBookingInput = {
  id: string;
};

export type RescheduleBookingInput = {
  id: string;
  start: string;
  end: string;
  timezone?: string;
};

export type CalendarAdapter = {
  readonly provider: CalendarProviderId;
  listFreeSlots(input: ListSlotsInput): Promise<CalendarResult<FreeSlot[]>>;
  createBooking(input: BookingRequest): Promise<CalendarResult<Booking>>;
  cancelBooking(input: CancelBookingInput): Promise<CalendarResult<Booking>>;
  rescheduleBooking(
    input: RescheduleBookingInput,
  ): Promise<CalendarResult<Booking>>;
};

export type FetchLike = typeof fetch;

export type AdapterDeps = {
  env?: NodeJS.ProcessEnv;
  fetch?: FetchLike;
  now?: () => Date;
  enabled?: boolean;
  /** Local Google / Microsoft OAuth token store (memory or file). Never commit contents. */
  tokenStore?: TokenStore;
};

export function calendarFailure(
  error: CalendarErrorCode,
  message: string,
): CalendarFailure {
  return { ok: false, error, message };
}

export function calendarSuccess<T>(data: T): CalendarSuccess<T> {
  return { ok: true, data };
}
