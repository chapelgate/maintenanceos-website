import { siteConfig } from "@/config/site";

export function PreLaunchBanner() {
  if (siteConfig.publicLaunch) return null;
  return (
    <div className="bg-dusk px-4 py-2 text-center text-sm text-on-dusk">
      Pre-launch / early access — MaintenanceOS is not commercially generally
      available yet.{" "}
      <a href="/demo/#launch" className="underline hover:text-accent-luminous">
        Join the launch list
      </a>
    </div>
  );
}
