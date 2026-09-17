import { LegalDraftBanner } from "@/components/LegalDraftBanner";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Privacy" };

export default function Page() {
  return (
    <>
      <PageHero
        title="Privacy"
        lede="Scaffold policy page. Content below is placeholder only."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LegalDraftBanner />
        <div className="space-y-4 text-muted">
          <p>
            This Privacy document is a draft for legal review. It does not
            constitute final policy, advice, or a binding agreement.
          </p>
          <p>
            When a form endpoint is configured, lead data will be processed
            according to the published policy. Until then, client-side stubs do
            not transmit email.
          </p>
          <p>
            Contact: use the{" "}
            <a href="/contact/" className="text-accent underline">
              contact form
            </a> 
            for pre-launch enquiries.
          </p>
        </div>
      </div>
    </>
  );
}
