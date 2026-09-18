type CtaPairProps = {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function CtaPair({
  primaryHref = "/demo/#launch",
  primaryLabel = "Join launch list",
  secondaryHref = "/demo/",
  secondaryLabel = "Request early demo",
  className = "",
}: CtaPairProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={primaryHref}
        className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
      >
        {primaryLabel}
      </a>
      <a
        href={secondaryHref}
        className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent hover:text-accent"
      >
        {secondaryLabel}
      </a>
    </div>
  );
}
