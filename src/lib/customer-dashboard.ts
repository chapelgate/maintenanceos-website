/**
 * Claims-safe customer dashboard client for the static /dashboard journey.
 * Talks to packages/customer-dashboard over an absolute URL, or an in-browser
 * SAMPLE catalogue when the public flag is on and no endpoint is configured.
 * Never invents customers, live metrics, or missing session ids.
 */

export type DashboardCatalogKind = "demo" | "empty";

export type CallSession = {
  id: string;
  kind: "demo";
  sampleLabel: "SAMPLE";
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  direction: "inbound";
  outcome: "caller_left_details" | "transferred_on_request" | "ended";
  summary: string;
  callerDisplay: string;
};

export type TranscriptTurn = {
  speaker: "caller" | "assistant";
  text: string;
};

export type Transcript = {
  sessionId: string;
  kind: "demo";
  sampleLabel: "SAMPLE";
  disclaimer: string;
  turns: TranscriptTurn[];
};

export type DashboardBooking = {
  id: string;
  kind: "demo";
  sampleLabel: "SAMPLE";
  provider: "mock";
  start: string;
  end: string;
  timezone: string;
  title: string;
  status: "confirmed" | "cancelled";
  note: string;
};

export type SessionList = {
  kind: DashboardCatalogKind;
  disclaimer: string;
  sessions: CallSession[];
};

export type BookingList = {
  kind: DashboardCatalogKind;
  disclaimer: string;
  bookings: DashboardBooking[];
};

export type SessionDetail = {
  kind: DashboardCatalogKind;
  disclaimer: string;
  session: CallSession;
  transcript: Transcript;
};

export type DashboardOutcome<T> =
  | { status: "disabled" }
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

const DEMO_DISCLAIMER =
  "SAMPLE / DEMO catalogue only. These rows are labelled examples for local testing. They are not live production metrics, customers, or telephony history.";

const EMPTY_DISCLAIMER =
  "This store is empty. The dashboard does not invent customers, call history, transcripts, or bookings.";

const TRANSCRIPT_DISCLAIMER =
  "SAMPLE transcript for local dashboard testing. Not a live call recording or production conversation.";

const BROWSER_DEMO_SESSIONS: CallSession[] = [
  {
    id: "demo_session_1",
    kind: "demo",
    sampleLabel: "SAMPLE",
    startedAt: "2026-09-18T09:12:00.000Z",
    endedAt: "2026-09-18T09:15:04.000Z",
    durationSeconds: 184,
    direction: "inbound",
    outcome: "caller_left_details",
    summary:
      "SAMPLE — boiler callback request for a fictional demo lettings desk. Not a live customer.",
    callerDisplay: "Sample caller A (demo) · +44 7700 900001",
  },
  {
    id: "demo_session_2",
    kind: "demo",
    sampleLabel: "SAMPLE",
    startedAt: "2026-09-17T16:40:00.000Z",
    endedAt: "2026-09-17T16:43:22.000Z",
    durationSeconds: 202,
    direction: "inbound",
    outcome: "transferred_on_request",
    summary:
      "SAMPLE — caller asked to speak to a person. Transfer is illustrated only; no live telephony ran.",
    callerDisplay: "Sample caller B (demo) · +44 7700 900002",
  },
];

const BROWSER_DEMO_TRANSCRIPTS: Record<string, Transcript> = {
  demo_session_1: {
    sessionId: "demo_session_1",
    kind: "demo",
    sampleLabel: "SAMPLE",
    disclaimer: TRANSCRIPT_DISCLAIMER,
    turns: [
      {
        speaker: "assistant",
        text: "SAMPLE: Hello, this is the MaintenanceOS demo desk. How can I help?",
      },
      {
        speaker: "caller",
        text: "SAMPLE: The boiler at the demo flat is making a banging noise. Can someone call me back?",
      },
      {
        speaker: "assistant",
        text: "SAMPLE: I can take your details for a callback. I will not invent a booking or dispatch anyone.",
      },
      {
        speaker: "caller",
        text: "SAMPLE: Thanks — please use the demo number on this example row.",
      },
    ],
  },
  demo_session_2: {
    sessionId: "demo_session_2",
    kind: "demo",
    sampleLabel: "SAMPLE",
    disclaimer: TRANSCRIPT_DISCLAIMER,
    turns: [
      {
        speaker: "assistant",
        text: "SAMPLE: MaintenanceOS demo desk. I can take a message or connect you if you ask.",
      },
      {
        speaker: "caller",
        text: "SAMPLE: Please put me through to a person.",
      },
      {
        speaker: "assistant",
        text: "SAMPLE: Transfer on request is illustrated here only. No live call was placed.",
      },
    ],
  },
};

const BROWSER_DEMO_BOOKINGS: DashboardBooking[] = [
  {
    id: "demo_booking_1",
    kind: "demo",
    sampleLabel: "SAMPLE",
    provider: "mock",
    start: "2026-09-21T08:00:00.000Z",
    end: "2026-09-21T08:30:00.000Z",
    timezone: "Europe/London",
    title: "SAMPLE — calendar adapter test slot",
    status: "confirmed",
    note: "Stub from the calendar-adapter shape. Not a live phone booking confirmation.",
  },
];

export const DEMO_SESSION_IDS = BROWSER_DEMO_SESSIONS.map((row) => row.id);

export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function dashboardEndpointBase(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
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

function asSampleSession(value: unknown): CallSession | null {
  const src = asRecord(value);
  if (!src) return null;
  const id = asNonEmptyString(src.id);
  const startedAt = asNonEmptyString(src.startedAt);
  const endedAt = asNonEmptyString(src.endedAt);
  const summary = asNonEmptyString(src.summary);
  const callerDisplay = asNonEmptyString(src.callerDisplay);
  if (!id || !startedAt || !endedAt || !summary || !callerDisplay) return null;
  if (src.kind !== "demo" || src.sampleLabel !== "SAMPLE") return null;
  if (!/\b(SAMPLE|DEMO)\b/i.test(`${summary} ${callerDisplay}`)) return null;
  const outcome = asNonEmptyString(src.outcome);
  if (
    outcome !== "caller_left_details" &&
    outcome !== "transferred_on_request" &&
    outcome !== "ended"
  ) {
    return null;
  }
  const duration =
    typeof src.durationSeconds === "number" && Number.isFinite(src.durationSeconds)
      ? src.durationSeconds
      : 0;
  return {
    id,
    kind: "demo",
    sampleLabel: "SAMPLE",
    startedAt,
    endedAt,
    durationSeconds: duration,
    direction: "inbound",
    outcome,
    summary,
    callerDisplay,
  };
}

function asSampleTranscript(value: unknown, sessionId: string): Transcript | null {
  const src = asRecord(value);
  if (!src) return null;
  if (src.kind !== "demo" || src.sampleLabel !== "SAMPLE") return null;
  const turnsRaw = Array.isArray(src.turns) ? src.turns : [];
  const turns: TranscriptTurn[] = [];
  for (const item of turnsRaw) {
    const rec = asRecord(item);
    const speaker = asNonEmptyString(rec?.speaker);
    const text = asNonEmptyString(rec?.text);
    if ((speaker !== "caller" && speaker !== "assistant") || !text) continue;
    if (!/\bSAMPLE\b/i.test(text)) continue;
    turns.push({ speaker, text });
  }
  if (!turns.length) return null;
  return {
    sessionId,
    kind: "demo",
    sampleLabel: "SAMPLE",
    disclaimer: asNonEmptyString(src.disclaimer) || TRANSCRIPT_DISCLAIMER,
    turns,
  };
}

function asSampleBooking(value: unknown): DashboardBooking | null {
  const src = asRecord(value);
  if (!src) return null;
  const id = asNonEmptyString(src.id);
  const start = asNonEmptyString(src.start);
  const end = asNonEmptyString(src.end);
  const title = asNonEmptyString(src.title);
  if (!id || !start || !end || !title) return null;
  if (src.kind !== "demo" || src.sampleLabel !== "SAMPLE") return null;
  if (!/\b(SAMPLE|DEMO)\b/i.test(title)) return null;
  const status = asNonEmptyString(src.status);
  if (status !== "confirmed" && status !== "cancelled") return null;
  return {
    id,
    kind: "demo",
    sampleLabel: "SAMPLE",
    provider: "mock",
    start,
    end,
    timezone: asNonEmptyString(src.timezone) || "Europe/London",
    title,
    status,
    note:
      asNonEmptyString(src.note) ||
      "Stub from the calendar-adapter shape. Not a live phone booking confirmation.",
  };
}

export function mapSessionList(body: unknown): SessionList | null {
  const root = asRecord(body);
  const src = asRecord(root?.data) ?? root;
  if (!src) return null;
  const kind = src.kind === "empty" ? "empty" : src.kind === "demo" ? "demo" : null;
  if (!kind) return null;
  const list = Array.isArray(src.sessions) ? src.sessions : [];
  const sessions: CallSession[] = [];
  for (const item of list) {
    const mapped = asSampleSession(item);
    if (mapped) sessions.push(mapped);
  }
  return {
    kind,
    disclaimer: asNonEmptyString(src.disclaimer) || (kind === "empty" ? EMPTY_DISCLAIMER : DEMO_DISCLAIMER),
    sessions,
  };
}

export function mapBookingList(body: unknown): BookingList | null {
  const root = asRecord(body);
  const src = asRecord(root?.data) ?? root;
  if (!src) return null;
  const kind = src.kind === "empty" ? "empty" : src.kind === "demo" ? "demo" : null;
  if (!kind) return null;
  const list = Array.isArray(src.bookings) ? src.bookings : [];
  const bookings: DashboardBooking[] = [];
  for (const item of list) {
    const mapped = asSampleBooking(item);
    if (mapped) bookings.push(mapped);
  }
  return {
    kind,
    disclaimer: asNonEmptyString(src.disclaimer) || (kind === "empty" ? EMPTY_DISCLAIMER : DEMO_DISCLAIMER),
    bookings,
  };
}

export function mapSessionDetail(body: unknown): SessionDetail | null {
  const root = asRecord(body);
  const src = asRecord(root?.data) ?? root;
  if (!src) return null;
  const session = asSampleSession(src.session);
  if (!session) return null;
  const transcript = asSampleTranscript(src.transcript, session.id);
  if (!transcript) return null;
  return {
    kind: "demo",
    disclaimer: asNonEmptyString(src.disclaimer) || DEMO_DISCLAIMER,
    session,
    transcript,
  };
}

function browserSessionList(kind: DashboardCatalogKind): SessionList {
  return {
    kind,
    disclaimer: kind === "demo" ? DEMO_DISCLAIMER : EMPTY_DISCLAIMER,
    sessions: kind === "demo" ? BROWSER_DEMO_SESSIONS : [],
  };
}

function browserBookingList(kind: DashboardCatalogKind): BookingList {
  return {
    kind,
    disclaimer: kind === "demo" ? DEMO_DISCLAIMER : EMPTY_DISCLAIMER,
    bookings: kind === "demo" ? BROWSER_DEMO_BOOKINGS : [],
  };
}

function browserSessionDetail(
  kind: DashboardCatalogKind,
  id: string,
): DashboardOutcome<SessionDetail> {
  if (kind === "empty") {
    return {
      status: "error",
      message:
        "No sample session exists for that id. The dashboard does not invent customers or transcripts.",
    };
  }
  const session = BROWSER_DEMO_SESSIONS.find((row) => row.id === id.trim());
  const transcript = BROWSER_DEMO_TRANSCRIPTS[id.trim()];
  if (!session || !transcript) {
    return {
      status: "error",
      message:
        "No sample session exists for that id. The dashboard does not invent customers or transcripts.",
    };
  }
  return {
    status: "ok",
    data: {
      kind: "demo",
      disclaimer: DEMO_DISCLAIMER,
      session,
      transcript,
    },
  };
}

const REQUEST_TIMEOUT_MS = 12_000;

async function getDashboard<T>(
  url: string,
  map: (body: unknown) => T | null,
  emptyError: string,
): Promise<DashboardOutcome<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
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
          "The dashboard companion did not return usable rows. Nothing was invented.",
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
        "The dashboard companion is unavailable just now. No customers were invented.",
    };
  } finally {
    clearTimeout(timer);
  }
}

function rejectRelativeEndpoint(): DashboardOutcome<never> {
  return {
    status: "error",
    message:
      "Dashboard endpoint is not a valid http(s) URL. Static export cannot use relative API routes. No rows were invented.",
  };
}

export async function requestDashboardSessions(input: {
  enabled: boolean;
  endpoint: string;
  catalogKind?: DashboardCatalogKind;
}): Promise<DashboardOutcome<SessionList>> {
  if (!input.enabled) return { status: "disabled" };
  const endpoint = dashboardEndpointBase(input.endpoint);
  if (!endpoint) {
    return { status: "ok", data: browserSessionList(input.catalogKind ?? "demo") };
  }
  if (!isAbsoluteHttpUrl(endpoint)) return rejectRelativeEndpoint();
  return getDashboard(
    `${endpoint}/sessions`,
    mapSessionList,
    "The companion returned no usable session list. No customers were invented.",
  );
}

export async function requestDashboardSession(input: {
  enabled: boolean;
  endpoint: string;
  id: string;
  catalogKind?: DashboardCatalogKind;
}): Promise<DashboardOutcome<SessionDetail>> {
  if (!input.enabled) return { status: "disabled" };
  const endpoint = dashboardEndpointBase(input.endpoint);
  if (!endpoint) {
    return browserSessionDetail(input.catalogKind ?? "demo", input.id);
  }
  if (!isAbsoluteHttpUrl(endpoint)) return rejectRelativeEndpoint();
  return getDashboard(
    `${endpoint}/sessions/${encodeURIComponent(input.id)}`,
    mapSessionDetail,
    "The companion did not return a labelled SAMPLE transcript. Nothing was invented.",
  );
}

export async function requestDashboardBookings(input: {
  enabled: boolean;
  endpoint: string;
  catalogKind?: DashboardCatalogKind;
}): Promise<DashboardOutcome<BookingList>> {
  if (!input.enabled) return { status: "disabled" };
  const endpoint = dashboardEndpointBase(input.endpoint);
  if (!endpoint) {
    return { status: "ok", data: browserBookingList(input.catalogKind ?? "demo") };
  }
  if (!isAbsoluteHttpUrl(endpoint)) return rejectRelativeEndpoint();
  return getDashboard(
    `${endpoint}/bookings`,
    mapBookingList,
    "The companion returned no usable booking list. No bookings were invented.",
  );
}

export function formatSessionWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins <= 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export function formatBookingWindow(booking: DashboardBooking): string {
  const start = new Date(booking.start);
  const end = new Date(booking.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return booking.start;
  }
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: booking.timezone || "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(start);
  const startTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: booking.timezone || "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(start);
  const endTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: booking.timezone || "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(end);
  return `${date}, ${startTime}–${endTime} (${booking.timezone || "Europe/London"})`;
}

export function outcomeLabel(outcome: CallSession["outcome"]): string {
  switch (outcome) {
    case "caller_left_details":
      return "Caller left details";
    case "transferred_on_request":
      return "Transferred on request";
    default:
      return "Ended";
  }
}
