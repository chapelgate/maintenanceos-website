type CtaPairProps = {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
  tone?: "default" | "on-dusk";
};

export function CtaPair({
  primaryHref = "/create/",
  primaryLabel = "Create from website",
  secondaryHref = "/demo/#demo",
  secondaryLabel = "Request early access",
  className = "",
  tone = "default",
}: CtaPairProps) {
  const onDusk = tone === "on-dusk";
  const primaryClass = onDusk
    ? "inline-flex min-h-6 min-w-6 items-center justify-center rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
    : "inline-flex min-h-6 min-w-6 items-center justify-center rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover";
  const secondaryClass = onDusk
    ? "inline-flex min-h-6 min-w-6 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-on-dusk hover:border-accent-luminous hover:text-accent-luminous"
    : "inline-flex min-h-6 min-w-6 items-center justify-center rounded-2xl border border-border bg-white/55 px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent hover:text-accent";

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a href={primaryHref} className={primaryClass}>
        {primaryLabel}
      </a>
      <a href={secondaryHref} className={secondaryClass}>
        {secondaryLabel}
      </a>
    </div>
  );
}
