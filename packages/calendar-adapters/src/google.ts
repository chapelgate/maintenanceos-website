import { googleEnvCredentials, exchangeRefreshToken } from "./oauth.ts";
import { computeFreeSlots, parseInstant, validateRange } from "./slots.ts";
import {
  calendarFailure,
  calendarSuccess,
  type AdapterDeps,
  type Booking,
  type BookingRequest,
  type CalendarAdapter,
  type CalendarResult,
  type CancelBookingInput,
  type FetchLike,
  type FreeSlot,
  type ListSlotsInput,
  type RescheduleBookingInput,
} from "./types.ts";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";
const DEFAULT_TITLE = "ReceptionistOS adapter test";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function busyFromFreeBusy(body: unknown, calendarId: string): { start: Date; end: Date }[] {
  const root = asRecord(body);
  const calendars = asRecord(root?.calendars);
  const cal = asRecord(calendars?.[calendarId]) ?? asRecord(calendars?.primary);
  const busy = cal?.busy;
  if (!Array.isArray(busy)) return [];
  const out: { start: Date; end: Date }[] = [];
  for (const item of busy) {
    const rec = asRecord(item);
    const start = typeof rec?.start === "string" ? parseInstant(rec.start) : null;
    const end = typeof rec?.end === "string" ? parseInstant(rec.end) : null;
    if (start && end) out.push({ start, end });
  }
  return out;
}

function bookingFromEvent(
  body: unknown,
  fallback: { start: string; end: string; timezone: string; title: string },
): Booking | null {
  const rec = asRecord(body);
  const id = typeof rec?.id === "string" ? rec.id.trim() : "";
  if (!id) return null;
  const startObj = asRecord(rec.start);
  const endObj = asRecord(rec.end);
  const start =
    (typeof startObj?.dateTime === "string" && parseInstant(startObj.dateTime)
      ? new Date(startObj.dateTime).toISOString()
      : fallback.start);
  const end =
    (typeof endObj?.dateTime === "string" && parseInstant(endObj.dateTime)
      ? new Date(endObj.dateTime).toISOString()
      : fallback.end);
  return {
    id,
    provider: "google",
    start,
    end,
    timezone:
      (typeof startObj?.timeZone === "string" && startObj.timeZone) || fallback.timezone,
    title: typeof rec.summary === "string" && rec.summary.trim() ? rec.summary : fallback.title,
    status: rec.status === "cancelled" ? "cancelled" : "confirmed",
  };
}

export function createGoogleCalendarAdapter(deps: AdapterDeps = {}): CalendarAdapter {
  const env = deps.env ?? process.env;
  const fetchFn: FetchLike = deps.fetch ?? fetch;
  let cachedToken: { value: string; exp: number } | null = null;

  async function accessToken(): Promise<CalendarResult<string>> {
    const creds = googleEnvCredentials(env);
    if (!creds) {
      return calendarFailure(
        "not_configured",
        "Google Calendar OAuth env is not set (GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, GOOGLE_CALENDAR_REFRESH_TOKEN). No booking was created.",
      );
    }
    if (cachedToken && cachedToken.exp > Date.now() + 5_000) {
      return calendarSuccess(cachedToken.value);
    }
    const token = await exchangeRefreshToken({
      tokenUrl: TOKEN_URL,
      clientId: creds.clientId,
      clientSecret: creds.clientSecret,
      refreshToken: creds.refreshToken,
      fetch: fetchFn,
    });
    if (!token.ok) return token;
    cachedToken = {
      value: token.data.accessToken,
      exp: Date.now() + (token.data.expiresIn ?? 3500) * 1000,
    };
    return calendarSuccess(token.data.accessToken);
  }

  async function api(
    method: string,
    path: string,
    token: string,
    body?: unknown,
  ): Promise<{ status: number; json: unknown }> {
    const res = await fetchFn(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let json: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }
    return { status: res.status, json };
  }

  return {
    provider: "google",

    async listFreeSlots(input: ListSlotsInput): Promise<CalendarResult<FreeSlot[]>> {
      const range = validateRange(input.from, input.to);
      if (!range.ok) {
        return calendarFailure(
          "invalid_range",
          "from/to must be valid ISO-8601 instants and to must be after from.",
        );
      }
      const token = await accessToken();
      if (!token.ok) return token;
      const creds = googleEnvCredentials(env);
      if (!creds) {
        return calendarFailure("not_configured", "Google Calendar OAuth env is not set.");
      }
      try {
        const res = await api("POST", "/freeBusy", token.data, {
          timeMin: range.from.toISOString(),
          timeMax: range.to.toISOString(),
          timeZone: input.timezone || "Europe/London",
          items: [{ id: creds.calendarId }],
        });
        if (res.status >= 400) {
          return calendarFailure(
            "provider_error",
            "Google Calendar freeBusy failed. No slots were invented.",
          );
        }
        return calendarSuccess(
          computeFreeSlots({
            from: range.from,
            to: range.to,
            busy: busyFromFreeBusy(res.json, creds.calendarId),
            slotMinutes: input.durationMinutes,
            timezone: input.timezone,
            now: deps.now?.() ?? new Date(),
          }),
        );
      } catch {
        return calendarFailure(
          "provider_error",
          "Google Calendar freeBusy could not be reached. No slots were invented.",
        );
      }
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
      const token = await accessToken();
      if (!token.ok) return token;
      const creds = googleEnvCredentials(env);
      if (!creds) {
        return calendarFailure("not_configured", "Google Calendar OAuth env is not set.");
      }
      const timezone = input.timezone || "Europe/London";
      const title = input.title?.trim() || DEFAULT_TITLE;
      try {
        const res = await api(
          "POST",
          `/calendars/${encodeURIComponent(creds.calendarId)}/events`,
          token.data,
          {
            summary: title,
            description: input.notes ?? "",
            start: { dateTime: start.toISOString(), timeZone: timezone },
            end: { dateTime: end.toISOString(), timeZone: timezone },
            attendees: input.attendeeEmail
              ? [{ email: input.attendeeEmail }]
              : undefined,
          },
        );
        const booking = bookingFromEvent(res.json, {
          start: start.toISOString(),
          end: end.toISOString(),
          timezone,
          title,
        });
        if (res.status >= 400 || !booking) {
          return calendarFailure(
            "provider_error",
            "Google Calendar did not confirm the event. No booking was invented.",
          );
        }
        return calendarSuccess(booking);
      } catch {
        return calendarFailure(
          "provider_error",
          "Google Calendar create event failed. No booking was invented.",
        );
      }
    },

    async cancelBooking(input: CancelBookingInput): Promise<CalendarResult<Booking>> {
      const id = input.id.trim();
      if (!id) {
        return calendarFailure("invalid_request", "Booking id is required. Nothing was cancelled.");
      }
      const token = await accessToken();
      if (!token.ok) return token;
      const creds = googleEnvCredentials(env);
      if (!creds) {
        return calendarFailure("not_configured", "Google Calendar OAuth env is not set.");
      }
      try {
        const res = await api(
          "DELETE",
          `/calendars/${encodeURIComponent(creds.calendarId)}/events/${encodeURIComponent(id)}`,
          token.data,
        );
        if (res.status === 404) {
          return calendarFailure(
            "booking_not_found",
            "Google Calendar has no event with that id. Nothing was cancelled.",
          );
        }
        if (res.status >= 400) {
          return calendarFailure(
            "provider_error",
            "Google Calendar did not confirm cancellation. The booking was not marked cancelled here.",
          );
        }
        return calendarSuccess({
          id,
          provider: "google",
          start: "",
          end: "",
          timezone: "Europe/London",
          title: "",
          status: "cancelled",
        });
      } catch {
        return calendarFailure(
          "provider_error",
          "Google Calendar cancel failed. The booking was not marked cancelled here.",
        );
      }
    },

    async rescheduleBooking(
      input: RescheduleBookingInput,
    ): Promise<CalendarResult<Booking>> {
      const id = input.id.trim();
      const start = parseInstant(input.start);
      const end = parseInstant(input.end);
      if (!id || !start || !end || end <= start) {
        return calendarFailure(
          "invalid_request",
          "Reschedule needs a booking id and valid start/end. Booking was left unchanged.",
        );
      }
      const token = await accessToken();
      if (!token.ok) return token;
      const creds = googleEnvCredentials(env);
      if (!creds) {
        return calendarFailure("not_configured", "Google Calendar OAuth env is not set.");
      }
      const timezone = input.timezone || "Europe/London";
      try {
        const res = await api(
          "PATCH",
          `/calendars/${encodeURIComponent(creds.calendarId)}/events/${encodeURIComponent(id)}`,
          token.data,
          {
            start: { dateTime: start.toISOString(), timeZone: timezone },
            end: { dateTime: end.toISOString(), timeZone: timezone },
          },
        );
        const booking = bookingFromEvent(res.json, {
          start: start.toISOString(),
          end: end.toISOString(),
          timezone,
          title: DEFAULT_TITLE,
        });
        if (res.status === 404) {
          return calendarFailure(
            "booking_not_found",
            "Google Calendar has no event with that id. Nothing was rescheduled.",
          );
        }
        if (res.status >= 400 || !booking) {
          return calendarFailure(
            "provider_error",
            "Google Calendar did not confirm the reschedule. Booking was left unchanged here.",
          );
        }
        return calendarSuccess(booking);
      } catch {
        return calendarFailure(
          "provider_error",
          "Google Calendar reschedule failed. Booking was left unchanged here.",
        );
      }
    },
  };
}
