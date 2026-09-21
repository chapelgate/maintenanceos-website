import { CalendarConnectComingSoon } from "@/components/CalendarConnectComingSoon";
import { CalendarConnectPanel } from "@/components/CalendarConnectPanel";
import { CreateJourney } from "@/components/CreateJourney";
import { CreateReceptionistForm } from "@/components/CreateReceptionistForm";
import { SandboxTestCallComingSoon } from "@/components/SandboxTestCallComingSoon";
import { siteConfig } from "@/config/site";

/**
 * Flagged-on /create islands (local / staging companions).
 * next.config aliases `create-funnel-islands.tsx` → this file when a public
 * companion flag is true at build. Not used on the default DigitalOcean export.
 */
export function CreateJourneySection() {
  if (!siteConfig.sandboxTestCallEnabled) {
    return (
      <>
        <CreateReceptionistForm />
        <div className="mt-6">
          <SandboxTestCallComingSoon />
        </div>
      </>
    );
  }

  return <CreateJourney />;
}

export function CalendarConnectSection() {
  if (!siteConfig.calendarAdaptersEnabled) {
    return <CalendarConnectComingSoon />;
  }

  return <CalendarConnectPanel />;
}
