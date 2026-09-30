import { FeatureStatusChip } from "@/components/FeatureStatusChip";

/**
 * Homepage hero proof — labelled UNDER TEST supervisor frame.
 * Structural preview only. No live counts, SLAs, logos, or DID theatre.
 */
const NAV_ITEMS = [
  { label: "Work orders", current: true },
  { label: "Properties", current: false },
  { label: "Contractors", current: false },
  { label: "Escalations", current: false },
  { label: "Evidence", current: false },
] as const;

const SAMPLE_ROWS = [
  { ref: "WO-sample", status: "In review", owner: "Supervisor", tone: "review" },
  { ref: "WO-sample", status: "Human review", owner: "Queue", tone: "human" },
  { ref: "WO-sample", status: "Rules hold", owner: "System", tone: "hold" },
] as const;

function RowTone({
  tone,
  children,
}: {
  tone: (typeof SAMPLE_ROWS)[number]["tone"];
  children: string;
}) {
  const cls =
    tone === "review"
      ? "rounded-md bg-accent-subtle px-1.5 py-0.5 text-xs font-medium text-accent"
      : tone === "human"
        ? "rounded-md border border-border bg-paper px-1.5 py-0.5 text-xs font-medium text-ink"
        : "rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs font-medium text-muted";

  return <span className={cls}>{children}</span>;
}

export function ProductUiShell() {
  return (
    <figure
      className="product-ui-shell overflow-hidden rounded-[var(--mos-radius-lg)] border border-border bg-surface shadow-[var(--mos-shadow)]"
      aria-label="Product UI shell mock — preview, not live"
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-paper px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </span>
          <span className="text-xs font-semibold text-muted">
            Supervisor shell · illustrative
          </span>
        </div>
        <FeatureStatusChip status="UNDER_TEST" />
      </figcaption>
      <div className="grid sm:grid-cols-[8.75rem_1fr]">
        <aside
          className="hidden border-r border-border bg-paper p-3 text-xs text-muted sm:block"
          aria-hidden="true"
        >
          <p className="mb-3 font-semibold text-ink">Workspace</p>
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.label}
                className={
                  item.current
                    ? "rounded-md bg-accent-subtle px-2 py-1.5 font-medium text-accent"
                    : "px-2 py-1.5"
                }
              >
                {item.label}
              </li>
            ))}
          </ul>
        </aside>
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">Work orders</h2>
            <p className="text-xs text-muted">Mock labels only — no live counts</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-paper text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Ref
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {SAMPLE_ROWS.map((row, index) => (
                  <tr key={`${row.ref}-${index}`}>
                    <td className="px-3 py-2.5 font-mono text-xs">{row.ref}</td>
                    <td className="px-3 py-2.5">
                      <RowTone tone={row.tone}>{row.status}</RowTone>
                    </td>
                    <td className="px-3 py-2.5 text-muted">{row.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Structural preview of a supervisor workspace. Status chips are
            illustrative. No invented throughput, SLA, or revenue figures.
          </p>
        </div>
      </div>
    </figure>
  );
}
