import {
  SAMPLE_LABEL,
  dashboardFailure,
  dashboardSuccess,
  type BookingList,
  type CallSession,
  type DashboardBooking,
  type DashboardCatalogKind,
  type DashboardResult,
  type DashboardStore,
  type SessionDetail,
  type SessionList,
  type Transcript,
} from "./types.ts";

const DEMO_DISCLAIMER =
  "SAMPLE / DEMO catalogue only. These rows are labelled examples for local testing. They are not live production metrics, customers, or telephony history.";

const EMPTY_DISCLAIMER =
  "This store is empty. The dashboard does not invent customers, call history, transcripts, or bookings.";

const TRANSCRIPT_DISCLAIMER =
  "SAMPLE transcript for local dashboard testing. Not a live call recording or production conversation.";

const DEMO_SESSIONS: CallSession[] = [
  {
    id: "demo_session_1",
    kind: "demo",
    sampleLabel: SAMPLE_LABEL,
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
    sampleLabel: SAMPLE_LABEL,
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

const DEMO_TRANSCRIPTS: Record<string, Transcript> = {
  demo_session_1: {
    sessionId: "demo_session_1",
    kind: "demo",
    sampleLabel: SAMPLE_LABEL,
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
    sampleLabel: SAMPLE_LABEL,
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

const DEMO_BOOKINGS: DashboardBooking[] = [
  {
    id: "demo_booking_1",
    kind: "demo",
    sampleLabel: SAMPLE_LABEL,
    provider: "mock",
    start: "2026-09-21T08:00:00.000Z",
    end: "2026-09-21T08:30:00.000Z",
    timezone: "Europe/London",
    title: "SAMPLE — calendar adapter test slot",
    status: "confirmed",
    note: "Stub from the calendar-adapter shape. Not a live phone booking confirmation.",
  },
];

export const DEMO_SESSION_IDS = DEMO_SESSIONS.map((session) => session.id);

function sessionList(kind: DashboardCatalogKind, sessions: CallSession[]): SessionList {
  return {
    kind,
    disclaimer: kind === "demo" ? DEMO_DISCLAIMER : EMPTY_DISCLAIMER,
    sessions,
  };
}

function bookingList(
  kind: DashboardCatalogKind,
  bookings: DashboardBooking[],
): BookingList {
  return {
    kind,
    disclaimer: kind === "demo" ? DEMO_DISCLAIMER : EMPTY_DISCLAIMER,
    bookings,
  };
}

export function createDashboardStore(
  kind: DashboardCatalogKind = "demo",
): DashboardStore {
  const sessions = kind === "demo" ? DEMO_SESSIONS : [];
  const transcripts = kind === "demo" ? DEMO_TRANSCRIPTS : {};
  const bookings = kind === "demo" ? DEMO_BOOKINGS : [];

  return {
    kind,

    listSessions() {
      return sessionList(kind, sessions);
    },

    getSession(id: string): DashboardResult<SessionDetail> {
      const trimmed = id.trim();
      if (!trimmed) {
        return dashboardFailure(
          "invalid_request",
          "Session id is required. No session was invented.",
        );
      }
      const session = sessions.find((row) => row.id === trimmed);
      const transcript = transcripts[trimmed];
      if (!session || !transcript) {
        return dashboardFailure(
          "session_not_found",
          "No sample session exists for that id. The dashboard does not invent customers or transcripts.",
        );
      }
      return dashboardSuccess({
        kind,
        disclaimer: DEMO_DISCLAIMER,
        session,
        transcript,
      });
    },

    listBookings() {
      return bookingList(kind, bookings);
    },
  };
}

export function createEmptyDashboardStore(): DashboardStore {
  return createDashboardStore("empty");
}

export function createDemoDashboardStore(): DashboardStore {
  return createDashboardStore("demo");
}
