/**
 * Compact public gas / carbon monoxide safety block (static, no JS).
 * Public safety information only. MaintenanceOS does not handle gas
 * emergencies; this is not a product claim.
 */
export function GasSafetyBlock({ headingId = "gas-safety-heading" }: { headingId?: string }) {
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-[var(--mos-radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-5 text-sm leading-relaxed text-[var(--color-warning-text)]"
    >
      <h2 id={headingId} className="text-base font-semibold">
        If a resident smells gas
      </h2>
      <p className="mt-2">
        Public safety advice, not a MaintenanceOS service: tell residents to get
        out and get fresh air, not to use switches or flames, to turn off the gas
        at the meter if it&apos;s safe to reach (not in a cellar), and to call the
        National Gas Emergency Service on{" "}
        <a href="tel:0800111999" className="font-semibold underline underline-offset-2">
          0800 111 999
        </a>{" "}
        (Northern Ireland:{" "}
        <a href="tel:0800002001" className="font-semibold underline underline-offset-2">
          0800 002 001
        </a>
        ). If someone is unwell or in danger, call{" "}
        <a href="tel:999" className="font-semibold underline underline-offset-2">
          999
        </a>
        .{" "}
        <a href="/how-we-keep-control/#gas" className="font-semibold underline underline-offset-2">
          Gas and carbon monoxide steps
        </a>
      </p>
    </section>
  );
}
