import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact"
        lede="General enquiries about MaintenanceOS. For demos and launch-list signup, prefer the dedicated forms on the demo page."
      />
      <div className="mx-auto max-w-xl px-4 py-12">
        <LeadCaptureForm
          leadType="contact"
          title="Send a message"
          submitLabel="Send enquiry"
          showMessage
        />
        <p className="mt-6 text-sm text-muted">
          Looking for a demo?{" "}
          <a href="/demo/" className="text-accent underline">
            Request early demo
          </a>
          .
        </p>
      </div>
    </>
  );
}
