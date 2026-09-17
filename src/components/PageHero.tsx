type PageHeroProps = {
  title: string;
  lede: string;
  eyebrow?: string;
};

export function PageHero({ title, lede, eyebrow }: PageHeroProps) {
  return (
    <header className="border-b border-border bg-surface px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-muted">{lede}</p>
      </div>
    </header>
  );
}
