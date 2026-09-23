import { IntakeOrbAccent } from "@/components/IntakeOrbAccent";
import { industryRoles } from "@/config/industries";

/**
 * Eight UK industries, equal weight — audience labels, no preferred hierarchy.
 */
export function HomeIndustries() {
  return (
    <section
      id="industries"
      aria-labelledby="home-industries-heading"
      className="border-b border-border px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="section-band-head">
          <IntakeOrbAccent />
          <div>
            <h2
              id="home-industries-heading"
              className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            >
              Built for UK maintenance audiences
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Equal weight — eight sectors, no ranking.
            </p>
          </div>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {industryRoles.map((ind) => (
            <li key={ind.slug}>
              <a
                href={`/industries/${ind.slug}/`}
                className="block h-full rounded-[var(--mos-radius-lg)] border border-border bg-surface px-4 py-4 text-sm font-semibold text-ink shadow-[var(--mos-shadow)] hover:border-accent hover:text-accent"
              >
                {ind.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm">
          <a
            href="/industries/"
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            All eight UK verticals
          </a>
        </p>
      </div>
    </section>
  );
}
