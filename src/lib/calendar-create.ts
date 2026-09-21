/**
 * Claims-safe calendar client for the static /create journey.
 * Talks to packages/calendar-adapters over an absolute URL, or an in-browser
 * mock when the public flag is on and no endpoint is configured.
 * Companion Google OAuth (GET /oauth/google/start → /callback + local token
 * store) is process-local. Unset credentials → not_configured; never invent a
 * booking id. Do not treat staging mock as live Google Calendar.
 */

export type CalendarSlot = {
  start: string;
  end: string;
  timezone: string;
};

export type CalendarBooking = {
  id: string;
  provider: string;
  start: string;
  end: string;
  timezone: string;
  title: string;
  status: string;
};

export type CalendarOutcome<T> =
  | { status: "disabled" }
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

const WEEKDAYS = new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]);

export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function calendarEndpointBase(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

export function defaultSlotWindow(now = new Date()): { from: string; to: string } {
  const from = new Date(now.getTime());
  const to = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function formatSlotLabel(slot: CalendarSlot): string {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return slot.start;
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: slot.timezone || "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(start);
  const startTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: slot.timezone || "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(start);
  const endTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: slot.timezone || "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(end);
  return `${date}, ${startTime}–${endTime} (${slot.timezone || "Europe/London"})`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

/** Map only a confirmed booking shape. Missing id → empty (not invented). */
export function mapBookingResponse(body: unknown): CalendarBooking | null {
  const root = asRecord(body);
  const src = asRecord(root?.data) ?? root;
  if (!src) return null;
  const id = asNonEmptyString(src.id);
  const start = asNonEmptyString(src.start);
  const end = asNonEmptyString(src.end);
  if (!id || !start || !end) return null;
  return {
    id,
    provider: asNonEmptyString(src.provider) || "unknown",
    start,
    end,
    timezone: asNonEmptyString(src.timezone) || "Europe/London",
    title: asNonEmptyString(src.title) || "Adapter test",
    status: asNonEmptyString(src.status) || "confirmed",
  };
}

export function mapSlotsResponse(body: unknown): CalendarSlot[] {
  const root = asRecord(body);
  const list = Array.isArray(root?.data)
    ? root.data
    : Array.isArray(root?.slots)
      ? root.slots
      : [];
  const out: CalendarSlot[] = [];
  for (const item of list) {
    const rec = asRecord(item);
    const start = asNonEmptyString(rec?.start);
    const end = asNonEmptyString(rec?.end);
    if (!start || !end) continue;
    out.push({
      start,
      end,
      timezone: asNonEmptyString(rec?.timezone) || "Europe/London",
    });
  }
  return out;
}

type BrowserMockState = {
  bookings: CalendarBooking[];
  seq: number;
};

const browserMock: BrowserMockState = { bookings: [], seq: 0 };

export function resetBrowserCalendarMock(): void {
  browserMock.bookings = [];
  browserMock.seq = 0;
}

function partsInZone(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const map = Object.fromEntries(
    fmt.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    weekday: map.weekday ?? "",
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

export function browserMockSlots(input: {
  from: string;
  to: string;
  timezone?: string;
  now?: Date;
}): CalendarSlot[] {
  const timezone = input.timezone || "Europe/London";
  const from = Date.parse(input.from);
  const to = Date.parse(input.to);
  if (Number.isNaN(from) || Number.isNaN(to) || to <= from) return [];
  const now = input.now ?? new Date();
  const step = 30 * 60 * 1000;
  let cursor = from;
  const rem = cursor % step;
  if (rem) cursor += step - rem;
  const busy = browserMock.bookings
    .filter((booking) => booking.status === "confirmed")
    .map((booking) => ({
      start: Date.parse(booking.start),
      end: Date.parse(booking.end),
    }));
  const slots: CalendarSlot[] = [];
  for (let t = cursor; t + step <= to; t += step) {
    const start = new Date(t);
    const end = new Date(t + step);
    if (end <= now) continue;
    const p = partsInZone(start, timezone);
    if (!WEEKDAYS.has(p.weekday)) continue;
    if (p.minute !== 0 && p.minute !== 30) continue;
    if (p.hour < 9 || p.hour >= 17) continue;
    if (busy.some((block) => t < block.end && block.start < t + step)) continue;
    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      timezone,
    });
  }
  return slots;
}

function browserMockBook(input: {
  start: string;
  end: string;
  timezone?: string;
  title?: string;
}): CalendarOutcome<CalendarBooking> {
  const start = Date.parse(input.start);
  const end = Date.parse(input.end);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return {
      status: "error",
      message:
        "That slot is not a valid time range. No booking was created.",
    };
  }
  const conflict = browserMock.bookings.some(
    (booking) =>
      booking.status === "confirmed" &&
      start < Date.parse(booking.end) &&
      Date.parse(booking.start) < end,
  );
  if (conflict) {
    return {
      status: "error",
      message:
        "That slot is not free in the local mock adapter. No booking was created.",
    };
  }
  browserMock.seq += 1;
  const booking: CalendarBooking = {
    id: `browser_mock_${browserMock.seq}`,
    provider: "mock",
    start: new Date(start).toISOString(),
    end: new Date(end).toISOString(),
    timezone: input.timezone || "Europe/London",
    title: input.title?.trim() || "Local adapter test",
    status: "confirmed",
  };
  browserMock.bookings.push(booking);
  return { status: "ok", data: booking };
}

const REQUEST_TIMEOUT_MS = 12_000;

async function postCalendar<T>(
  url: string,
  payload: unknown,
  map: (body: unknown) => T | null,
  emptyError: string,
): Promise<CalendarOutcome<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }
    if (!res.ok) {
      const rec = asRecord(parsed);
      const message = asNonEmptyString(rec?.message);
      return {
        status: "error",
        message:
          message ||
          "The calendar adapter did not confirm this request. No booking was invented.",
      };
    }
    const mapped = map(parsed);
    if (!mapped) {
      return { status: "error", message: emptyError };
    }
    return { status: "ok", data: mapped };
  } catch {
    return {
      status: "error",
      message:
        "The calendar adapter is unavailable just now. No booking was invented.",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function requestCalendarSlots(input: {
  enabled: boolean;
  endpoint: string;
  from: string;
  to: string;
  timezone?: string;
  now?: Date;
}): Promise<CalendarOutcome<CalendarSlot[]>> {
  if (!input.enabled) return { status: "disabled" };
  const endpoint = calendarEndpointBase(input.endpoint);
  if (!endpoint) {
    return {
      status: "ok",
      data: browserMockSlots({
        from: input.from,
        to: input.to,
        timezone: input.timezone,
        now: input.now,
      }),
    };
  }
  if (!isAbsoluteHttpUrl(endpoint)) {
    return {
      status: "error",
      message:
        "Calendar endpoint is not a valid http(s) URL. Static export cannot use relative API routes. No slots were invented.",
    };
  }
  return postCalendar(
    `${endpoint}/slots`,
    {
      from: input.from,
      to: input.to,
      timezone: input.timezone || "Europe/London",
    },
    (body) => mapSlotsResponse(body),
    "The adapter returned no usable slots. No slots were invented.",
  );
}

export async function requestCalendarBooking(input: {
  enabled: boolean;
  endpoint: string;
  start: string;
  end: string;
  timezone?: string;
  title?: string;
}): Promise<CalendarOutcome<CalendarBooking>> {
  if (!input.enabled) return { status: "disabled" };
  const endpoint = calendarEndpointBase(input.endpoint);
  if (!endpoint) {
    return browserMockBook(input);
  }
  if (!isAbsoluteHttpUrl(endpoint)) {
    return {
      status: "error",
      message:
        "Calendar endpoint is not a valid http(s) URL. No booking was created.",
    };
  }
  return postCalendar(
    `${endpoint}/bookings`,
    {
      start: input.start,
      end: input.end,
      timezone: input.timezone || "Europe/London",
      title: input.title || "Create-journey adapter test",
    },
    mapBookingResponse,
    "The adapter did not return a booking id. No booking was invented.",
  );
}
