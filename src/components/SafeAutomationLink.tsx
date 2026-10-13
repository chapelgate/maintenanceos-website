/**
 * Points at the one full safety block on /how-we-keep-control/#safe-automation.
 */
export function SafeAutomationLink({ className = "" }: { className?: string }) {
  return (
    <p className={`mx-auto max-w-6xl px-4 py-4 text-xs leading-relaxed text-muted ${className}`.trim()}>
      Fixed rules own safety and money.{" "}
      <a
        href="/how-we-keep-control/#safe-automation"
        className="font-medium text-accent underline-offset-4 hover:underline"
      >
        Read the safety controls →
      </a>
    </p>
  );
}
