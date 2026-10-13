import React from "react";

type BentoCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function BentoCard({
  title,
  description,
  icon,
  footer,
  className = "",
}: BentoCardProps) {
  return (
    <article
      className={`mos-bento-card rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 sm:p-6 transition-all hover:border-accent/40 flex flex-col justify-between ${className}`.trim()}
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          {icon ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-subtle text-accent shrink-0">
              {icon}
            </div>
          ) : null}
          <h3 className="text-base font-semibold text-ink">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
      {footer ? <div className="mt-4 pt-3 border-t border-border/50">{footer}</div> : null}
    </article>
  );
}
