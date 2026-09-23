import { siteConfig } from "@/config/site";

export function PreLaunchBanner() {
  if (siteConfig.publicLaunch) return null;
  return (
    <div className="border-b border-border bg-accent-subtle px-4 py-1.5 text-center text-sm text-ink">
      Pre-launch / early access — MaintenanceOS is not commercially generally
      available yet.{" "}
      <a
        href="/demo/#launch"
        className="font-semibold text-accent underline underline-offset-2 hover:text-accent-hover"
      >
        Join the launch list
      </a>
    </div>
  );
}
