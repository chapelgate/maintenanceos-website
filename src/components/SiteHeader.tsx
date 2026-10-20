import { industries, primaryNav } from "@/config/site";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/**
 * Shell chrome stays a server component. Compact widths (through 1100px) use
 * one header row and a hamburger. Wider viewports show a single desktop row.
 * Escape closes an open disclosure and returns focus. Outside clicks and link
 * activation close it without moving focus.
 * CTA label: Request an early demo (single primary, /demo/).
 */

const HEADER_DETAILS_SCRIPT = `(function(){function summary(d){return d.querySelector("summary");}function place(){var bottom=0;document.querySelectorAll("header.site-header").forEach(function(header){bottom=Math.max(bottom,Math.ceil(header.getBoundingClientRect().bottom));});var node=document.getElementById("site-header-place");if(!node){node=document.createElement("style");node.id="site-header-place";document.head.appendChild(node);}node.textContent="header.site-header{--site-header-bottom:"+bottom+"px}";}function sync(d){var c=summary(d);if(!c)return;var open=d.open;c.setAttribute("aria-expanded",open?"true":"false");var label=c.getAttribute("aria-label");if(label==="Open menu"||label==="Close menu"){c.setAttribute("aria-label",open?"Close menu":"Open menu");}}document.querySelectorAll("header details").forEach(function(d){d.addEventListener("toggle",function(){place();sync(d);});sync(d);});place();document.addEventListener("DOMContentLoaded",place);window.addEventListener("load",place);window.addEventListener("resize",place);window.addEventListener("scroll",place,{passive:true});document.addEventListener("click",function(event){var node=event.target;var target=node&&node.nodeType===1?node:node&&node.parentElement;if(!target||!target.closest)return;document.querySelectorAll("header details[open]").forEach(function(d){if(d.contains(target)){if(target.closest("a"))d.open=false;return;}d.open=false;});});document.addEventListener("keydown",function(event){if(event.key!=="Escape")return;document.querySelectorAll("header details[open]").forEach(function(d){d.open=false;var c=summary(d);if(c)c.focus();});});})();`;

function Wordmark() {
  return (
    <a
      href="/"
      className="inline-flex items-baseline gap-2 text-lg tracking-tight text-ink"
    >
      <span className="font-semibold">WorkSmartOS</span>
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
    <header className="site-header sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur-md supports-[backdrop-filter]:bg-paper/78">
      <div className="site-header-bar mx-auto flex min-h-16 w-full flex-wrap items-center justify-between px-4 md:px-6">
        <Wordmark />

        <nav className="site-header-desktop" aria-label="Primary">
          {primaryNav.map((item) =>
            "children" in item && item.children ? (
              <details key={item.href} className="relative">
                <summary
                  className="site-nav-link inline-flex h-9 min-h-6 min-w-6 cursor-pointer list-none items-center rounded-md px-2.5 text-sm font-medium text-ink hover:text-accent [&::-webkit-details-marker]:hidden"
                  aria-expanded="false"
                >
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
                <ul className="site-menu-panel absolute left-0 top-full z-50 mt-2 min-w-[15rem] rounded-xl border border-border bg-surface py-2 shadow-[var(--mos-shadow)]">
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

          <a
            href="/demo/"
            className="ml-2 inline-flex h-9 min-h-6 min-w-6 items-center whitespace-nowrap rounded-md bg-accent px-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
          >
            Request an early demo
          </a>
        <LanguageSwitcher />
        </nav>

        <details className="site-header-compact">
          <summary
            className="inline-flex h-9 w-9 min-h-6 min-w-6 cursor-pointer list-none items-center justify-center rounded-md border border-border text-ink [&::-webkit-details-marker]:hidden"
            aria-expanded="false"
            aria-label="Open menu"
          >
            <MenuIcon />
          </summary>
          <nav
            className="site-menu-panel site-header-menu rounded-xl border border-border bg-surface px-4 py-4 shadow-[var(--mos-shadow)]"
            aria-label="Mobile"
          >
            <ul className="flex flex-col flex-wrap gap-1">
              <li>
                <a
                  href="/demo/"
                  className="inline-flex h-10 min-h-6 w-full items-center justify-center rounded-md bg-accent px-3 text-sm font-semibold text-on-accent"
                >
                  Request an early demo
                </a>
              </li>
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
      <script dangerouslySetInnerHTML={{ __html: HEADER_DETAILS_SCRIPT }} />
    </header>
  );
}
