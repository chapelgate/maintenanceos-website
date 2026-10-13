import { industryRoles } from "@/config/industries";

/**
 * Eight UK industries, equal weight — compact clickable sector pills.
 */
export function HomeIndustries() {
  return (
    <section
      id="industries"
      aria-labelledby="home-industries-heading"
      className="border-b border-border px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="section-band-head">
          <div>
            <h2
              id="home-industries-heading"
              className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
            >
              Built for UK maintenance audiences
            </h2>
            <p className="mt-1 text-xs text-muted">Equal weight.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {industryRoles.map((ind) => (
            <a
              key={ind.slug}
              href={`/industries/${ind.slug}/`}
              className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {ind.label}
            </a>
          ))}
        </div>
        <p className="mt-4 text-xs">
          <a
            href="/industries/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            All eight UK verticals →
          </a>
        </p>
      </div>
    </section>
  );
}
