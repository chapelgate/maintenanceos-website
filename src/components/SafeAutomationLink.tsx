/**
 * Points at the one full safety block on /how-we-keep-control/#safe-automation.
 */
export function SafeAutomationLink({ className = "" }: { className?: string }) {
  return (
    <p className={`mx-auto max-w-6xl px-4 py-6 text-sm leading-relaxed text-muted ${className}`.trim()}>
      Fixed rules and an authorised person keep control of safety and money.{" "}
      <a
        href="/how-we-keep-control/#safe-automation"
        className="font-medium text-accent underline-offset-4 hover:underline"
      >
        Read the safety controls
      </a>
    </p>
  );
}
