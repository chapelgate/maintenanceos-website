type CtaPairProps = {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function CtaPair({
  primaryHref = "/demo/",
  primaryLabel = "Request an early demo",
  secondaryHref = "/how-we-keep-control/",
  secondaryLabel = "See the safety rules",
  className = "",
}: CtaPairProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}>
      <a
        href={primaryHref}
        className="inline-flex min-h-11 min-w-6 w-full items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:w-auto"
      >
        {primaryLabel}
      </a>
      <a
        href={secondaryHref}
        className="inline-flex min-h-11 min-w-6 w-full items-center justify-center px-3 py-2.5 text-sm font-semibold text-accent underline decoration-border underline-offset-4 hover:decoration-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
      >
        {secondaryLabel}
      </a>
    </div>
  );
}
