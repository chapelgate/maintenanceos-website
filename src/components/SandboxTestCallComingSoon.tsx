/**
 * Default /create sandbox copy when the test-call flag is off (DigitalOcean static).
 * Server component — do not import the scripted-demo client here.
 */
export function SandboxTestCallComingSoon() {
  const comingCopyId = "sandbox-test-call-coming-copy";

  return (
    <section
      className="mos-glass p-5"
      data-sandbox-test-call="off"
      aria-labelledby="sandbox-test-call-heading"
      aria-describedby={comingCopyId}
    >
      <h2
        id="sandbox-test-call-heading"
        className="text-base font-semibold text-ink"
      >
        Sandbox test call — under testing / coming
      </h2>
      <p id={comingCopyId} className="mt-2 text-sm text-muted">
        A feature-flagged sandbox session lives in{" "}
        <code className="text-xs">packages/sandbox-test-call</code> behind{" "}
        <code className="text-xs">SANDBOX_TEST_CALL_ENABLED=false</code>{" "}
        (default off). When enabled locally, a pack-aware scripted demo is
        one click — still not a live customer phone number, not production
        telephony, and the frozen live voice path is untouched.
      </p>
    </section>
  );
}
