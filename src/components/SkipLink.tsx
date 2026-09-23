/**
 * Visually hidden until focused; high-contrast when focused.
 * Explicit focus reveal (not focus:not-sr-only) for Tailwind v4 reliability.
 * Clears .sr-only clip + nowrap on focus (K8 — Accessibility review on #23).
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:[clip:auto] focus:whitespace-normal focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:m-0 focus-visible:h-auto focus-visible:w-auto focus-visible:overflow-visible focus-visible:[clip:auto] focus-visible:whitespace-normal focus-visible:rounded-md focus-visible:bg-accent focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-on-accent"
    >
      Skip to main content
    </a>
  );
}
