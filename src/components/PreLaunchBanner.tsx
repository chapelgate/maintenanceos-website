import { siteConfig } from "@/config/site";

export function PreLaunchBanner() {
  if (siteConfig.publicLaunch) return null;
  return (
    <div className="border-b border-border bg-accent-subtle px-4 py-1.5 text-center text-sm text-ink">
      Pre-launch · in testing — MaintenanceOS is not commercially generally
      available yet.
    </div>
  );
}
