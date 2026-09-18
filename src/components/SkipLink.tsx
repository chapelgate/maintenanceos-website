/**
 * Visually hidden until focused; high-contrast when focused.
 * Explicit focus reveal (not focus:not-sr-only) for Tailwind v4 reliability.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
