/**
 * Default /create calendar copy when adapters are off (DigitalOcean static).
 * Server component — do not import the slot-picker client here.
 */
export function CalendarConnectComingSoon() {
  const comingCopyId = "calendar-connect-coming-copy";

  return (
    <section
      className="mos-glass p-5"
      data-calendar-adapters="off"
      aria-labelledby="calendar-connect-heading"
      aria-describedby={comingCopyId}
    >
      <h2
        id="calendar-connect-heading"
        className="text-base font-semibold text-ink"
      >
        Calendar connect — coming / under testing
      </h2>
      <p id={comingCopyId} className="mt-2 text-sm text-muted">
        Google Calendar and Microsoft 365 adapters live in{" "}
        <code className="text-xs">packages/calendar-adapters</code> behind{" "}
        <code className="text-xs">CALENDAR_ADAPTERS_ENABLED=false</code> (default
        off). This page does not book a live appointment and does not confirm a
        phone booking.
      </p>
    </section>
  );
}
