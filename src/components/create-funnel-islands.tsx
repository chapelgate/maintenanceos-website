import { CalendarConnectComingSoon } from "@/components/CalendarConnectComingSoon";
import { CreateJourney } from "@/components/CreateJourney";

/**
 * Default /create islands for the DigitalOcean static export.
 *
 * The customer-facing interactive receptionist preview is part of the normal
 * journey. Its heavier conversation module is dynamically loaded inside
 * CreateJourney. Hosted calendar/live-media companions remain separate and off
 * unless their own reviewed flags are enabled.
 */
export function CreateJourneySection() {
  return <CreateJourney />;
}

export function CalendarConnectSection() {
  return <CalendarConnectComingSoon />;
}
