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
      className="mx-auto max-w-4xl px-4 py-6"
    >
      <h2
        id="see-it-work-heading"
        className="text-xl font-semibold text-ink"
      >
        Sample call to summary to controlled workflow
      </h2>
      <p className="mt-1 text-xs text-muted">
        Using fictional SAMPLE data. Not a live customer call.
      </p>

      <div className="mt-4">
        <h3 className="text-xs font-semibold text-ink">1. Tour</h3>
        <div className="mt-1">
          <ProductTour />
        </div>
      </div>

      <div className="mt-4" id="sample-dashboard">
        <h3 className="text-xs font-semibold text-ink">2. Transcript</h3>
        <div className="mt-1">
          <CustomerDashboard demoMode />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-semibold text-ink">3. Workflow</h3>
        <div className="mt-1">
          <ProductUiShell />
        </div>
      </div>
    </section>
  );
}
