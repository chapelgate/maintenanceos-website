import { CalendarConnectComingSoon } from "@/components/CalendarConnectComingSoon";
import { CreateReceptionistForm } from "@/components/CreateReceptionistForm";
import { SandboxTestCallComingSoon } from "@/components/SandboxTestCallComingSoon";

/**
 * Default /create islands for DigitalOcean static export (companion flags off).
 * Do not import CreateJourney, CalendarConnectPanel, or SandboxTestCallPanel
 * from this file — Next includes those client modules in First Load JS if they
 * appear anywhere in the page graph. Flagged-on local builds resolve this
 * module to `create-funnel-islands.enabled.tsx` via next.config.
 */
export function CreateJourneySection() {
  return (
    <>
      <CreateReceptionistForm />
      <div className="mt-6">
        <SandboxTestCallComingSoon />
      </div>
    </>
  );
}

export function CalendarConnectSection() {
  return <CalendarConnectComingSoon />;
}
