import { industries, primaryNav } from "@/config/site";

/**
 * Shell #11 chrome (flat-ink wordmark, blue dual CTAs, hamburger) via native <details>.
 * Server component (PERFORMANCE_BUDGET: no layout chrome `"use client"`).
 * Escape → close open details and return focus to summary is a tiny inline
 * script so content routes do not hydrate React for the header.
 * CTA label: Request an early demo (single primary, /demo/).
 */

const HEADER_DETAILS_ESCAPE = `(function() {
  // Set CSS variable for header height
  function updateHeaderHeight() {
    const header = document.querySelector('header');
    if (header) {
      const headerHeight = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-height', \`\${headerHeight}px\`);
    }
  }
  // Update on load and resize
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight);
  window.addEventListener('orientationchange', updateHeaderHeight);

  // Handle toggle for mobile menu details to update aria-label and aria-expanded
  document.addEventListener('toggle', function(e) {
    if (e.target.matches('details.mobile-menu-details')) {
      const summary = e.target.querySelector('summary');
      if (summary) {
        if (e.target.open) {
          summary.setAttribute('aria-label', 'Close menu');
          summary.setAttribute('aria-expanded', 'true');
        } else {
          summary.setAttribute('aria-label', 'Open menu');
          summary.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });

  // Handle click outside to close open details elements
  document.addEventListener('click', function(e) {
    // If click is inside a details element, do nothing (let it handle its own state)
    if (e.target.closest('details')) {
      return;
    }
    // Close all open details elements in header and return focus to their summary
    document.querySelectorAll('header details[open]').forEach(function(details) {
      details.open = false;
      const summary = details.querySelector('summary');
      if (summary) {
        summary.focus();
      }
    });
  });

  // Handle Escape key to close open details elements and return focus
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('header details[open]').forEach(function(details) {
        details.open = false;
        const summary = details.querySelector('summary');
        if (summary) {
          summary.focus();
        }
      });
    }
  });
})();`

function Wordmark() {
  return (
    <a
      href="/"
      className="inline-flex items-baseline text-lg tracking-tight text-ink"
    >
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
    <header className="sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur-md supports-[backdrop-filter]:bg-paper/78">
      <div className="mx-auto flex min-h-14 max-w-[70rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 md:min-h-16 md:px-6">
        <Wordmark />

        <nav
          className="hidden flex-wrap items-center gap-1 [min-width:1100px]:flex lg:gap-2"
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
                >
                  <li>
                    <a
                      href={item.href}
                      className="block px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
                    >
                      All industries
                    </a>
                  </li>
                  {industries.map((ind) => (
                    <li key={ind.slug}>
                      <a
                        href={`/industries/${ind.slug}/`}
                        className="block px-4 py-2 text-sm text-muted hover:bg-paper hover:text-ink"
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
              href="/demo/"
              className="inline-flex h-9 min-h-6 min-w-6 items-center whitespace-nowrap rounded-md bg-accent px-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              Request an early demo
            </a>
          </div>
        </nav>

        <div className="flex items-center justify-between [min-width:1100px]:hidden">
          <a
            href="/demo/"
            className="inline-flex h-9 min-h-6 min-w-6 items-center whitespace-nowrap rounded-md bg-accent px-3 text-sm font-semibold text-on-accent"
          >
            Request an early demo
          </a>
          <details className="relative mobile-menu-details">
            <summary
              className="inline-flex h-9 w-9 min-h-6 min-w-6 cursor-pointer list-none items-center justify-center rounded-md border border-border text-ink [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </summary>
            <nav
              className="site-menu-panel absolute right-0 top-full z-50 mt-2 w-[min(100vw-1rem,20rem)] max-h-[calc(100dvh-var(--header-height))] overflow-y-auto rounded-xl border border-border bg-surface px-4 py-4 shadow-[var(--mos-shadow)]"
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
                    href="/how-we-keep-control/"
                    className="site-cta-outline inline-flex h-10 min-h-6 w-full items-center justify-center rounded-md border border-border px-3 text-sm font-semibold text-ink"
                  >
                    See the safety rules
                  </a>
                </li>
              </ul>
            </nav>
          </details>
        </div>
        <script dangerouslySetInnerHTML={{ __html: HEADER_DETAILS_ESCAPE }} />
      </div>
      </header>
    );
}
