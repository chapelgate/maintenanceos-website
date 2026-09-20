/**
 * Claims-safe customer dashboard types for ReceptionistOS.
 * Rows are either labelled SAMPLE/DEMO or absent. Never invent live customers.
 */

export const DASHBOARD_KINDS = ["demo", "empty"] as const;
export type DashboardCatalogKind = (typeof DASHBOARD_KINDS)[number];

export const SAMPLE_LABEL = "SAMPLE" as const;
export type SampleLabel = typeof SAMPLE_LABEL;

export type DashboardErrorCode =
  | "dashboard_disabled"
  | "invalid_request"
  | "session_not_found"
  | "not_configured";

export type DashboardFailure = {
  ok: false;
  error: DashboardErrorCode;
  message: string;
};

export type DashboardSuccess<T> = {
  ok: true;
  data: T;
};

export type DashboardResult<T> = DashboardSuccess<T> | DashboardFailure;

export type CallDirection = "inbound";

export type CallOutcome =
  | "caller_left_details"
  | "transferred_on_request"
  | "ended";

export type CallSession = {
  id: string;
  kind: "demo";
  sampleLabel: SampleLabel;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  direction: CallDirection;
  outcome: CallOutcome;
  summary: string;
  callerDisplay: string;
};

export type TranscriptSpeaker = "caller" | "assistant";

export type TranscriptTurn = {
  speaker: TranscriptSpeaker;
  text: string;
};

export type Transcript = {
  sessionId: string;
  kind: "demo";
  sampleLabel: SampleLabel;
  disclaimer: string;
  turns: TranscriptTurn[];
};

export type DashboardBookingStatus = "confirmed" | "cancelled";

/**
 * Bookings stub aligned with calendar-adapter fields, plus SAMPLE labelling.
 * Not a live phone booking confirmation.
 */
export type DashboardBooking = {
  id: string;
  kind: "demo";
  sampleLabel: SampleLabel;
  provider: "mock";
  start: string;
  end: string;
  timezone: string;
  title: string;
  status: DashboardBookingStatus;
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

export type DashboardStore = {
  readonly kind: DashboardCatalogKind;
  listSessions(): SessionList;
  getSession(id: string): DashboardResult<SessionDetail>;
  listBookings(): BookingList;
};

export function dashboardFailure(
  error: DashboardErrorCode,
  message: string,
): DashboardFailure {
  return { ok: false, error, message };
}

export function dashboardSuccess<T>(data: T): DashboardSuccess<T> {
  return { ok: true, data };
}

export function isSampleLabeled(value: { sampleLabel?: string; summary?: string; title?: string; callerDisplay?: string }): boolean {
  const hay = [
    value.sampleLabel,
    value.summary,
    value.title,
    value.callerDisplay,
  ]
    .filter(Boolean)
    .join(" ");
  return /\b(SAMPLE|DEMO)\b/i.test(hay);
}
