import { industries, primaryNav, siteConfig } from "@/config/site";

/**
 * Shell #11 chrome (flat-ink wordmark, blue dual CTAs, hamburger) via native <details>.
 * Server component (PERFORMANCE_BUDGET: no layout chrome `"use client"`).
 * Escape → close open details and return focus to summary is a tiny inline
 * script so content routes do not hydrate React for the header.
 * CTA labels: Create from website (primary) / Early access (secondary briefing).
 */

const HEADER_DETAILS_ESCAPE = `document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;document.querySelectorAll("header details[open]").forEach(function(d){d.open=false;var s=d.querySelector("summary");s&&s.focus();});});`;

function Wordmark() {
  return (
    <a href="/" className="text-lg text-ink" aria-label={siteConfig.name}>
      <span className="font-medium">Maintenance</span>
      <span className="font-semibold">OS</span>
    </a>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M3.5 6h13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M3.5 10h13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M3.5 14h13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-[70rem] items-center justify-between gap-4 px-4 md:px-6">
        <Wordmark />

        <nav
          className="hidden items-center gap-1 md:flex lg:gap-2"
          aria-label="Primary"
        >
          {primaryNav.map((item) =>
            "children" in item && item.children ? (
              <details key={item.href} className="relative">
                <summary className="site-nav-link inline-flex h-9 min-h-6 min-w-6 cursor-pointer list-none items-center rounded-md px-2.5 text-sm font-medium text-ink hover:text-accent [&::-webkit-details-marker]:hidden">
                  {item.label}
                  <svg
                    className="ml-1 opacity-60"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <ul
                  className="site-menu-panel absolute left-0 top-full z-50 mt-2 min-w-[15rem] rounded-xl border border-border bg-surface py-2 shadow-[var(--mos-shadow)]"
                  role="menu"
                >
                  <li role="none">
                    <a
                      href={item.href}
                      className="block px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
                      role="menuitem"
                    >
                      All industries
                    </a>
                  </li>
                  {industries.map((ind) => (
                    <li key={ind.slug} role="none">
                      <a
                        href={`/industries/${ind.slug}/`}
                        className="block px-4 py-2 text-sm text-muted hover:bg-paper hover:text-ink"
                        role="menuitem"
                      >
                        {ind.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="site-nav-link inline-flex h-9 min-h-6 items-center rounded-md px-2.5 text-sm font-medium text-ink hover:text-accent"
              >
                {item.label}
              </a>
            ),
          )}

          <div className="ml-2 flex shrink-0 items-center gap-2">
            <a
              href="/demo/#demo"
              className="site-cta-outline inline-flex h-9 min-h-6 min-w-6 items-center whitespace-nowrap rounded-md border border-border bg-surface px-3 text-sm font-semibold text-ink hover:border-accent hover:text-accent"
            >
              Early access
            </a>
            <a
              href="/create/"
              className="inline-flex h-9 min-h-6 min-w-6 items-center whitespace-nowrap rounded-md bg-accent px-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              Create from website
            </a>
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href="/create/"
            className="inline-flex h-9 min-h-6 min-w-6 items-center whitespace-nowrap rounded-md bg-accent px-3 text-sm font-semibold text-on-accent"
          >
            Create
          </a>
          <details className="relative">
            <summary
              className="inline-flex h-9 w-9 min-h-6 min-w-6 cursor-pointer list-none items-center justify-center rounded-md border border-border text-ink [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </summary>
            <nav
              className="site-menu-panel absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,20rem)] rounded-xl border border-border bg-surface px-4 py-4 shadow-[var(--mos-shadow)] md:hidden"
              aria-label="Mobile"
            >
              <ul className="flex flex-col gap-1">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block rounded-md px-2 py-2.5 text-base font-medium text-ink"
                    >
                      {item.label}
                    </a>
                    {"children" in item && item.children ? (
                      <ul className="mb-2 space-y-0.5 border-l border-border pl-3">
                        {industries.map((ind) => (
                          <li key={ind.slug}>
                            <a
                              href={`/industries/${ind.slug}/`}
                              className="block rounded-md px-2 py-1.5 text-sm text-muted"
                            >
                              {ind.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
                <li>
                  <a
                    href="/about/"
                    className="block rounded-md px-2 py-2 text-base text-muted"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/faq/"
                    className="block rounded-md px-2 py-2 text-base text-muted"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="/contact/"
                    className="block rounded-md px-2 py-2 text-base text-muted"
                  >
                    Contact
                  </a>
                </li>
                <li className="pt-2">
                  <a
                    href="/demo/#demo"
                    className="site-cta-outline inline-flex h-10 min-h-6 w-full items-center justify-center rounded-md border border-border px-3 text-sm font-semibold text-ink"
                  >
                    Request early access
                  </a>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: HEADER_DETAILS_ESCAPE }} />
    </header>
  );
}
