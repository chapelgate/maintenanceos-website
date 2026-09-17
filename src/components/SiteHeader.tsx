"use client";

import { useState } from "react";
import { industries, primaryNav, siteConfig } from "@/config/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="/" className="text-lg font-semibold text-ink">
          {siteConfig.name}
        </a>

        {/* Desktop primary (≥768px): How it works, Features, AI receptionist, Security, Pricing, Industries + CTA */}
        <nav
          className="hidden items-center gap-5 md:flex"
          aria-label="Primary"
        >
          {primaryNav.map((item) =>
            "children" in item && item.children ? (
              <div key={item.href} className="relative">
                <button
                  type="button"
                  className="text-sm font-medium text-ink hover:text-accent"
                  aria-expanded={industriesOpen}
                  aria-haspopup="true"
                  onClick={() => setIndustriesOpen((v) => !v)}
                  onBlur={(e) => {
                    if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                      setIndustriesOpen(false);
                    }
                  }}
                >
                  {item.label}
                </button>
                {industriesOpen ? (
                  <ul
                    className="absolute left-0 top-full z-50 mt-2 min-w-[14rem] rounded-md border border-border bg-surface py-2 shadow-lg"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <li>
                      <a
                        href={item.href}
                        className="block px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
                        onClick={() => setIndustriesOpen(false)}
                      >
                        All industries
                      </a>
                    </li>
                    {industries.map((ind) => (
                      <li key={ind.slug}>
                        <a
                          href={`/industries/${ind.slug}/`}
                          className="block px-4 py-2 text-sm text-muted hover:bg-paper hover:text-ink"
                          onClick={() => setIndustriesOpen(false)}
                        >
                          {ind.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink hover:text-accent"
              >
                {item.label}
              </a>
            ),
          )}
          <a
            href="/demo/#launch"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Join launch list
          </a>
        </nav>

        {/* Mobile bar */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href="/demo/#launch"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white"
          >
            Join launch list
          </a>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-surface px-4 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-3">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block text-base font-medium text-ink"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
                {"children" in item && item.children ? (
                  <ul className="mt-2 space-y-1 border-l border-border pl-3">
                    {industries.map((ind) => (
                      <li key={ind.slug}>
                        <a
                          href={`/industries/${ind.slug}/`}
                          className="block py-1 text-sm text-muted"
                          onClick={() => setOpen(false)}
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
                className="block text-base text-muted"
                onClick={() => setOpen(false)}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/faq/"
                className="block text-base text-muted"
                onClick={() => setOpen(false)}
              >
                FAQ
              </a>
            </li>
            <li>
              <a
                href="/contact/"
                className="block text-base text-muted"
                onClick={() => setOpen(false)}
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="/demo/"
                className="mt-2 inline-flex rounded-md border border-border px-3 py-2 text-sm font-semibold text-ink"
                onClick={() => setOpen(false)}
              >
                Request early demo
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
