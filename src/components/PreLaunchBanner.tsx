import { siteConfig } from "@/config/site";

export function PreLaunchBanner() {
  if (siteConfig.publicLaunch) return null;
  return (
    <div
      role="region"
      aria-label="Pre-launch notice"
      className="prelaunch-banner border-b border-border bg-accent-subtle px-4 py-1.5 text-center text-sm text-ink"
    >
      Pre-launch · in testing — WorkSmartOS MaintenanceOS is not commercially
      generally available. Not a public always-on phone line. No SLA claim.
    </div>
  );
}
