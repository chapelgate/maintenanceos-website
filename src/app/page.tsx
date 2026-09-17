import { CtaPair } from "@/components/CtaPair";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-surface px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">
            Pre-launch · Early access
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-5 text-lg text-muted">
            Maintenance department as a service for UK landlords, letting
            agents, and property managers. Deterministic safety rules and human
            clearance keep consequential decisions accountable — AI assists
            without final authority on safety or money.
          </p>
          <CtaPair className="mt-8 justify-center" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Clear operations",
              body: "Work orders, properties, residents, contractors, and communications designed as one accountable system — under testing, not commercially GA.",
            },
            {
              title: "Safety over autonomy",
              body: "Deterministic lifecycle and safety rules override AI. Critical paths require human clearance before consequential action.",
            },
            {
              title: "Honest AI receptionist",
              body: "Voice handling is under testing and in development. UK/999 guidance, human transfer on request, and no invented bookings or refunds.",
            },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-lg border border-border bg-surface p-6"
            >
              <h2 className="text-lg font-semibold text-ink">{card.title}</h2>
              <p className="mt-2 text-sm text-muted">{card.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          Explore{" "}
          <a href="/how-it-works/" className="text-accent underline">
            how it works
          </a>
          ,{" "}
          <a href="/features/" className="text-accent underline">
            features
          </a>
          , and{" "}
          <a href="/security/" className="text-accent underline">
            security
          </a>
          .
        </p>
      </section>

      <section id="join" className="border-t border-border bg-paper px-4 py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-semibold text-ink">Join the launch list</h2>
          <p className="mt-2 text-muted">
            Be notified when early access opens. No fake urgency — we are still
            pre-launch.
          </p>
          <div className="mt-6">
            <LeadCaptureForm
              leadType="launch_list"
              submitLabel="Join launch list"
              showOrganisation
            />
          </div>
        </div>
      </section>
    </>
  );
}
