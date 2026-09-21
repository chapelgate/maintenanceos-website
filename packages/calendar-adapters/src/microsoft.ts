import {
  exchangeRefreshToken,
  microsoftTokenUrl,
  resolveMicrosoftCredentials,
} from "./oauth.ts";
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

const GRAPH = "https://graph.microsoft.com/v1.0";
const DEFAULT_TITLE = "ReceptionistOS adapter test";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseGraphDateTime(value: unknown): Date | null {
  const rec = asRecord(value);
  const raw = typeof rec?.dateTime === "string" ? rec.dateTime : "";
  if (!raw) return null;
  const tz = typeof rec?.timeZone === "string" ? rec.timeZone : "";
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw)) return parseInstant(raw);
  if (tz.toUpperCase() === "UTC") {
    return parseInstant(raw.endsWith("Z") ? raw : `${raw}Z`);
  }
  return parseInstant(raw) ?? parseInstant(`${raw}Z`);
}

function busyFromSchedule(body: unknown): { start: Date; end: Date }[] {
  const root = asRecord(body);
  const value = Array.isArray(root?.value) ? root.value : [];
  const out: { start: Date; end: Date }[] = [];
  for (const row of value) {
    const items = asRecord(row)?.scheduleItems;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      const rec = asRecord(item);
      const start = parseGraphDateTime(rec?.start);
      const end = parseGraphDateTime(rec?.end);
      if (start && end) out.push({ start, end });
    }
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
  const start = parseGraphDateTime(rec.start);
  const end = parseGraphDateTime(rec.end);
  return {
    id,
    provider: "microsoft",
    start: start ? start.toISOString() : fallback.start,
    end: end ? end.toISOString() : fallback.end,
    timezone: fallback.timezone,
    title:
      typeof rec.subject === "string" && rec.subject.trim()
        ? rec.subject
        : fallback.title,
    status: rec.isCancelled === true ? "cancelled" : "confirmed",
  };
}

export function createMicrosoftCalendarAdapter(
  deps: AdapterDeps = {},
): CalendarAdapter {
  const env = deps.env ?? process.env;
  const fetchFn: FetchLike = deps.fetch ?? fetch;
  let cachedToken: { value: string; exp: number } | null = null;

  async function requireCreds() {
    const creds = await resolveMicrosoftCredentials(env, deps.tokenStore);
    if (!creds) {
      return calendarFailure(
        "not_configured",
        "Microsoft 365 Calendar OAuth is not configured (MICROSOFT_CALENDAR_CLIENT_ID, MICROSOFT_CALENDAR_CLIENT_SECRET, plus MICROSOFT_CALENDAR_REFRESH_TOKEN or a token stored via /oauth/microsoft/callback). No booking was created.",
      );
    }
    return calendarSuccess(creds);
  }

  async function accessToken(): Promise<CalendarResult<string>> {
    const creds = await requireCreds();
    if (!creds.ok) return creds;
    if (cachedToken && cachedToken.exp > Date.now() + 5_000) {
      return calendarSuccess(cachedToken.value);
    }
    const token = await exchangeRefreshToken({
      tokenUrl: microsoftTokenUrl(creds.data.tenant),
      clientId: creds.data.clientId,
      clientSecret: creds.data.clientSecret,
      refreshToken: creds.data.refreshToken,
      scope: "https://graph.microsoft.com/.default",
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
    const res = await fetchFn(`${GRAPH}${path}`, {
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
    provider: "microsoft",

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
      const timezone = input.timezone || "Europe/London";
      try {
        const res = await api("POST", "/me/calendar/getSchedule", token.data, {
          schedules: ["me"],
          startTime: {
            dateTime: range.from.toISOString().replace(/Z$/, ""),
            timeZone: "UTC",
          },
          endTime: {
            dateTime: range.to.toISOString().replace(/Z$/, ""),
            timeZone: "UTC",
          },
          availabilityViewInterval: input.durationMinutes || 30,
        });
        if (res.status >= 400) {
          return calendarFailure(
            "provider_error",
            "Microsoft Graph getSchedule failed. No slots were invented.",
          );
        }
        return calendarSuccess(
          computeFreeSlots({
            from: range.from,
            to: range.to,
            busy: busyFromSchedule(res.json),
            slotMinutes: input.durationMinutes,
            timezone,
            now: deps.now?.() ?? new Date(),
          }),
        );
      } catch {
        return calendarFailure(
          "provider_error",
          "Microsoft Graph getSchedule could not be reached. No slots were invented.",
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
      const timezone = input.timezone || "Europe/London";
      const title = input.title?.trim() || DEFAULT_TITLE;
      try {
        const res = await api("POST", "/me/events", token.data, {
          subject: title,
          body: { contentType: "text", content: input.notes ?? "" },
          start: { dateTime: start.toISOString(), timeZone: timezone },
          end: { dateTime: end.toISOString(), timeZone: timezone },
          attendees: input.attendeeEmail
            ? [
                {
                  emailAddress: { address: input.attendeeEmail },
                  type: "required",
                },
              ]
            : [],
        });
        const booking = bookingFromEvent(res.json, {
          start: start.toISOString(),
          end: end.toISOString(),
          timezone,
          title,
        });
        if (res.status >= 400 || !booking) {
          return calendarFailure(
            "provider_error",
            "Microsoft Graph did not confirm the event. No booking was invented.",
          );
        }
        return calendarSuccess(booking);
      } catch {
        return calendarFailure(
          "provider_error",
          "Microsoft Graph create event failed. No booking was invented.",
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
      try {
        const res = await api("DELETE", `/me/events/${encodeURIComponent(id)}`, token.data);
        if (res.status === 404) {
          return calendarFailure(
            "booking_not_found",
            "Microsoft Graph has no event with that id. Nothing was cancelled.",
          );
        }
        if (res.status >= 400) {
          return calendarFailure(
            "provider_error",
            "Microsoft Graph did not confirm cancellation. The booking was not marked cancelled here.",
          );
        }
        return calendarSuccess({
          id,
          provider: "microsoft",
          start: "",
          end: "",
          timezone: "Europe/London",
          title: "",
          status: "cancelled",
        });
      } catch {
        return calendarFailure(
          "provider_error",
          "Microsoft Graph cancel failed. The booking was not marked cancelled here.",
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
      const timezone = input.timezone || "Europe/London";
      try {
        const res = await api("PATCH", `/me/events/${encodeURIComponent(id)}`, token.data, {
          start: { dateTime: start.toISOString(), timeZone: timezone },
          end: { dateTime: end.toISOString(), timeZone: timezone },
        });
        const booking = bookingFromEvent(res.json, {
          start: start.toISOString(),
          end: end.toISOString(),
          timezone,
          title: DEFAULT_TITLE,
        });
        if (res.status === 404) {
          return calendarFailure(
            "booking_not_found",
            "Microsoft Graph has no event with that id. Nothing was rescheduled.",
          );
        }
        if (res.status >= 400 || !booking) {
          return calendarFailure(
            "provider_error",
            "Microsoft Graph did not confirm the reschedule. Booking was left unchanged here.",
          );
        }
        return calendarSuccess(booking);
      } catch {
        return calendarFailure(
          "provider_error",
          "Microsoft Graph reschedule failed. Booking was left unchanged here.",
        );
      }
    },
  };
}
