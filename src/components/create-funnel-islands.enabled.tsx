import { CalendarConnectPanel } from "@/components/CalendarConnectPanel";
import { CreateJourney } from "@/components/CreateJourney";
import { siteConfig } from "@/config/site";

/**
 * Flagged companion build. The public interactive receptionist preview remains
 * the same CreateJourney; only optional hosted companion integrations vary.
 */
export function CreateJourneySection() {
  return <CreateJourney />;
}

export function CalendarConnectSection() {
  if (!siteConfig.calendarAdaptersEnabled) {
    return null;
  }

  return <CalendarConnectPanel />;
}
