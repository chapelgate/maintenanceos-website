"use client";

import { useEffect, useId, useRef, useState } from "react";
import { industries, primaryNav, siteConfig } from "@/config/site";

function Wordmark() {
  return (
    <a href="/" className="text-lg text-ink" aria-label={siteConfig.name}>
      <span className="font-medium">Maintenance</span>
      <span className="font-semibold">OS</span>
    </a>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {open ? (
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      ) : (
        <>
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
        </>
      )}
    </svg>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const mobileNavId = useId();
  const industriesPanelId = useId();
  const industriesWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open && !industriesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setIndustriesOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, industriesOpen]);

  useEffect(() => {
    if (!industriesOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (
        industriesWrapRef.current &&
        !industriesWrapRef.current.contains(e.target as Node)
      ) {
        setIndustriesOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [industriesOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-[70rem] items-center justify-between gap-4 px-4 md:px-6">
        <Wordmark />

        <nav
          className="hidden items-center gap-1 lg:gap-2 md:flex"
          aria-label="Primary"
        >
          {primaryNav.map((item) =>
            "children" in item && item.children ? (
              <div key={item.href} className="relative" ref={industriesWrapRef}>
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-md px-2.5 text-sm font-medium text-ink transition-colors hover:text-accent"
                  aria-expanded={industriesOpen}
                  aria-haspopup="true"
                  aria-controls={industriesPanelId}
                  onClick={() => setIndustriesOpen((v) => !v)}
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
                </button>
                {industriesOpen ? (
                  <ul
                    id={industriesPanelId}
                    className="absolute left-0 top-full z-50 mt-2 min-w-[15rem] rounded-xl border border-border bg-surface py-2 shadow-[var(--mos-shadow)]"
                    role="menu"
                  >
                    <li role="none">
                      <a
                        href={item.href}
                        className="block px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
                        role="menuitem"
                        onClick={() => setIndustriesOpen(false)}
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
                className="inline-flex h-9 items-center rounded-md px-2.5 text-sm font-medium text-ink transition-colors hover:text-accent"
              >
                {item.label}
              </a>
            ),
          )}

          <div className="ml-2 flex items-center gap-2">
            <a
              href="/demo/"
              className="inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Request early demo
            </a>
            <a
              href="/demo/#launch"
              className="inline-flex h-9 items-center rounded-md bg-accent px-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              Join launch list
            </a>
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href="/demo/#launch"
            className="inline-flex h-9 items-center rounded-md bg-accent px-3 text-sm font-semibold text-on-accent"
          >
            Join launch list
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-ink"
            aria-expanded={open}
            aria-controls={mobileNavId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id={mobileNavId}
          className="border-t border-border bg-surface px-4 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-md px-2 py-2.5 text-base font-medium text-ink"
                  onClick={() => setOpen(false)}
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
                className="block rounded-md px-2 py-2 text-base text-muted"
                onClick={() => setOpen(false)}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/faq/"
                className="block rounded-md px-2 py-2 text-base text-muted"
                onClick={() => setOpen(false)}
              >
                FAQ
              </a>
            </li>
            <li>
              <a
                href="/contact/"
                className="block rounded-md px-2 py-2 text-base text-muted"
                onClick={() => setOpen(false)}
              >
                Contact
              </a>
            </li>
            <li className="pt-2">
              <a
                href="/demo/"
                className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border px-3 text-sm font-semibold text-ink"
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
