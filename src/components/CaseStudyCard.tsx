import React from "react";

type CaseStudyCardProps = {
  logo: { src: string; alt: string };
  quote: string;
  attribution: { name: string; role: string; company: string };
  cta?: { href: string; label: string };
  className?: string;
};

export function CaseStudyCard({
  logo,
  quote,
  attribution,
  cta,
  className = "",
}: CaseStudyCardProps) {
  return (
    <article
      className={`mos-bento-card rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 sm:p-6 transition-all hover:border-accent/40 flex flex-col justify-between ${className}`.trim()}
    >
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export + JS budget */}
        <img
          src={logo.src}
          alt={logo.alt}
          className="h-10 w-auto max-w-[180px] mb-4 object-contain"
          loading="lazy"
        />
        <blockquote className="text-base leading-relaxed text-ink mb-6">
          <p>&ldquo;{quote}&rdquo;</p>
        </blockquote>
      </div>
      <footer className="border-t border-border pt-4 space-y-2">
        <div className="flex items-center gap-2">
          <cite className="text-sm font-semibold text-ink not-italic">
            {attribution.name}
          </cite>
          <span className="text-sm text-muted" aria-hidden="true">
            &mdash;
          </span>
          <span className="text-sm text-muted">
            {attribution.role}, {attribution.company}
          </span>
        </div>
        {cta && (
          <a
            href={cta.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded"
          >
            {cta.label}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M5 11L11 5M11 5H5M11 5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </footer>
    </article>
  );
}