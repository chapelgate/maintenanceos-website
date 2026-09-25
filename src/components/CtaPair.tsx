type CtaPairProps = {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function CtaPair({
  primaryHref = "/create/",
  primaryLabel = "Create from website",
  secondaryHref = "/demo/#demo",
  secondaryLabel = "Request early access",
  className = "",
}: CtaPairProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}>
      <a
        href={primaryHref}
        className="inline-flex min-h-11 min-w-6 w-full items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover sm:w-auto"
      >
        {primaryLabel}
      </a>
      <a
        href={secondaryHref}
        className="inline-flex min-h-11 min-w-6 w-full items-center justify-center px-3 py-2.5 text-sm font-semibold text-accent underline decoration-border underline-offset-4 hover:decoration-accent sm:w-auto"
      >
        {secondaryLabel}
      </a>
    </div>
  );
}
