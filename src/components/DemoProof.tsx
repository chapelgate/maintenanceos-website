import { CtaPair } from "@/components/CtaPair";
import { CustomerDashboard } from "@/components/CustomerDashboard";
import { ProductTour } from "@/components/ProductTour";
import { ProductUiShell } from "@/components/ProductUiShell";

/**
 * Public claims-safe product demonstration assembled entirely from existing
 * website components and the existing in-browser SAMPLE catalogue.
 */
export function DemoProof() {
  return (
    <section
      id="see-it-work"
      aria-labelledby="see-it-work-heading"
      className="mx-auto max-w-5xl px-4 py-12 sm:py-16"
    >
      <p className="text-sm font-semibold text-accent">See it work</p>
      <h2
        id="see-it-work-heading"
        className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
      >
        Sample call to summary to controlled workflow
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
        Everything below reuses existing labelled demo assets. The call rows and
        transcript are fictional SAMPLE data. The supervisor shell is
        illustrative. Nothing is presented as a live customer call.
      </p>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-ink">1. Watch the product tour</h3>
        <p className="mt-2 text-sm text-muted">
          Click to play. The existing tour is captioned and remains claims-safe.
        </p>
        <div className="mt-4">
          <ProductTour />
        </div>
      </div>

      <div className="mt-10" id="sample-dashboard">
        <h3 className="text-lg font-semibold text-ink">
          2. Inspect a labelled sample call, summary and transcript
        </h3>
        <p className="mt-2 text-sm text-muted">
          The existing in-browser SAMPLE catalogue opens the first fictional
          call automatically. It uses no customer data and no live telephony.
        </p>
        <div className="mt-4">
          <CustomerDashboard demoMode />
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold text-ink">
          3. See the work-order and escalation path
        </h3>
        <p className="mt-2 text-sm text-muted">
          The existing supervisor shell shows the structural path from work
          order to human review and rules hold. Labels are illustrative, not
          production counts or SLA claims.
        </p>
        <div className="mt-4">
          <ProductUiShell />
        </div>
      </div>

      <CtaPair
        className="mt-10"
        primaryHref="/demo/#demo"
        primaryLabel="Request an early demo"
        secondaryHref="/create/"
        secondaryLabel="Try the website setup preview"
      />
    </section>
  );
}
