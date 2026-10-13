import React from "react";

type AccordionProps = {
  summary: string;
  children: React.ReactNode;
  name?: string;
  className?: string;
  defaultOpen?: boolean;
};

export function Accordion({
  summary,
  children,
  name,
  className = "",
  defaultOpen = false,
}: AccordionProps) {
  return (
    <details
      name={name}
      open={defaultOpen ? true : undefined}
      className={`mos-accordion group rounded-[var(--mos-radius-lg)] border border-border bg-surface p-4 transition-all open:bg-paper/50 ${className}`.trim()}
    >
      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-ink list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md">
        <span>{summary}</span>
        <span className="ml-2 text-muted transition-transform group-open:rotate-180 shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <div className="mt-3 pt-3 border-t border-border text-sm leading-relaxed text-muted space-y-2">
        {children}
      </div>
    </details>
  );
}
