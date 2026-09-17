import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "AI receptionist" };

export default function AiReceptionistPage() {
  return (
    <>
      <PageHero
        eyebrow="Under testing · In development"
        title="AI receptionist for maintenance intake"
        lede="An AI-assisted voice capability exists in product source and is under testing — not a live commercial service. We do not publish concurrent call numbers or claim production call-readiness."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        <section>
          <h2 className="text-xl font-semibold text-ink">What it is designed to do</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
            <li>Collect caller details into structured maintenance intake</li>
            <li>Use UK terminology and 999 emergency guidance (designed behaviour; live-carrier retest still required)</li>
            <li>Support explicit human transfer when the caller requests a person</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-ink">What it must not invent</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
            <li>Bookings, dispatches, or arrival times it cannot honour</li>
            <li>Refunds, compensation, fee waivers, or account changes</li>
            <li>Safety assurances beyond approved guidance</li>
          </ul>
        </section>
        <section className="rounded-md border border-border bg-surface p-5 text-sm text-muted">
          <p>
            Prior test and validation calls have occurred historically. Controlled
            production carrier testing on the current deployment remains gated.
            Architecture is being developed for concurrent operations — we will
            never invent capacity figures on this site.
          </p>
        </section>
        <p className="text-sm text-muted">
          See also{" "}
          <a href="/security/" className="text-accent underline">
            Security
          </a>{" "}
          and{" "}
          <a href="/how-it-works/" className="text-accent underline">
            How it works
          </a>
          .
        </p>
        <CtaPair />
      </div>
    </>
  );
}
