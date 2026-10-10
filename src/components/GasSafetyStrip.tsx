/**
 * Site-wide public gas-safety strip (static, no JS).
 * Public safety information only — not a MaintenanceOS product capability.
 * Sources (checked 10 Oct 2026): National Gas emergency contacts, HSE domestic
 * gas FAQs, Gas Safe Register, NHS, nidirect. See /how-we-keep-control/#gas.
 */
export function GasSafetyStrip() {
  return (
    <aside
      aria-label="Gas safety"
      className="border-b border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-4 py-2 text-sm leading-relaxed text-[var(--color-warning-text)]"
    >
      <p className="mx-auto max-w-[70rem]">
        <strong className="font-semibold">Smell gas?</strong> Get out, don&apos;t
        use switches or flames, and call the National Gas Emergency Service on{" "}
        <a
          href="tel:0800111999"
          className="inline-flex min-h-11 items-center font-semibold underline underline-offset-2 sm:min-h-0"
        >
          0800 111 999
        </a>
        . If someone is unwell or in danger, call{" "}
        <a
          href="tel:999"
          className="inline-flex min-h-11 items-center font-semibold underline underline-offset-2 sm:min-h-0"
        >
          999
        </a>
        .
      </p>
    </aside>
  );
}
