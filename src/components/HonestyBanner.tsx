import type { ReactNode } from "react";

/**
 * Shared honesty token — paper, muted, no cert theatre.
 * Reuse for “what we will not claim” and compact features honesty lines.
 */

export const DEFAULT_HONESTY_ITEMS = [
  "No fabricated customers, logos, or awards",
  "No ISO, SOC 2, or bank-grade claims we have not earned",
  "No “handles N concurrent lines” marketing numbers",
  "No public live receptionist claim until that gate is cleared",
] as const;

type HonestyBannerProps = {
  eyebrow?: string;
  title?: string;
  items?: readonly string[];
  children?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function HonestyBanner({
  eyebrow = "What we will not claim",
  title,
  items = DEFAULT_HONESTY_ITEMS,
  children,
  compact = false,
  className = "",
}: HonestyBannerProps) {
  if (compact) {
    return (
      <p className={`text-sm leading-relaxed text-muted ${className}`.trim()}>
        {children}
      </p>
    );
  }

  return (
    <section
      className={`border-y border-border bg-paper px-4 py-14 sm:px-6 ${className}`.trim()}
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-accent">
          {eyebrow}
        </p>
        {title ? (
          <h2 className="mt-3 text-center text-xl font-semibold text-ink">
            {title}
          </h2>
        ) : null}
        {children ? (
          <div className="mt-4 text-center text-sm leading-relaxed text-muted">
            {children}
          </div>
        ) : null}
        <ul className="mx-auto mt-6 max-w-xl space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-base leading-relaxed text-ink"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
