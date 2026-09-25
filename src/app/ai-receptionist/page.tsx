import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "AI receptionist for UK maintenance intake",
  description:
    "MaintenanceOS by Chapelgate includes an AI receptionist capability for UK maintenance intake that is under testing and in development. Deterministic rules keep control of safety and money. Not a live commercial voice service.",
  path: "/ai-receptionist/",
});

const callFlow = [
  "Answer and gather caller details into structured maintenance intake",
  "Use UK terminology; emergency guidance points to 999 (never 911)",
  "Keep consequential commitments out of AI invention (booking, dispatch, money, or safety overclaim)",
  "On explicit request, support transfer to a human",
];

const ukSafety = [
  "Designed for UK terminology and 999 emergency guidance",
  "Regression tests in product source lock UK/999 behaviour and never-911 wording",
  "Live-carrier retest is still required for corrected accent and emergency wording on the current deployment",
];

const humanTransfer = [
  "Callers can request a person; transfer is explicit-request-only in product source",
  "Transfer quality is still under retest",
  "AI does not replace human clearance for critical safety or money decisions",
];

const mustNotInvent = [
  "Bookings, dispatches, or arrival times it cannot honour",
  "Refunds, compensation, fee waivers, or account changes",
  "Safety assurances beyond approved guidance",
];

export default function AiReceptionistPage() {
  return (
    <>
      <PageHero
        eyebrow="Under testing · In development"
        title="Capture maintenance calls without handing control to the AI"
        lede="The receptionist capability is being tested to collect caller details and classify maintenance requests in UK terminology. Server rules and authorised people retain control of safety and money. It is not a live commercial phone service."
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        <section>
          <h2 className="text-xl font-semibold text-ink">
            How a call is designed to work
          </h2>
          <p className="mt-2 text-sm text-muted">
            Designed behaviour under testing — not evidence of live commercial
            operations.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
            {callFlow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">UK safety wording</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            {ukSafety.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            This does not claim live emergency handling as a commercial service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Human transfer</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            {humanTransfer.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            What the AI must not invent
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            {mustNotInvent.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Deterministic safety rules and human clearance sit above voice
            assist. See{" "}
            <a href="/security/" className="text-accent underline">
              Security
            </a>{" "}
            and{" "}
            <a href="/how-it-works/" className="text-accent underline">
              How it works
            </a>
            .
          </p>
        </section>

        <section className="mos-glass p-5 text-sm text-muted">
          <h2 className="text-base font-semibold text-ink">Where we are</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Prior test and validation calls have occurred historically — not
              commercial general availability
            </li>
            <li>
              Controlled Gemini / carrier testing on the current DigitalOcean
              deployment remains gated — not available as &ldquo;live now&rdquo;
            </li>
            <li>
              Architecture for concurrent operations is being developed — we
              never invent concurrent-call capacity figures on this site
            </li>
            <li>Further controlled testing is underway</li>
          </ul>
        </section>

        <p className="text-sm text-muted">
          See also{" "}
          <a href="/property-maintenance-software/" className="text-accent underline">
            Property maintenance software
          </a>
          ,{" "}
          <a href="/how-it-works/" className="text-accent underline">
            How it works
          </a>
          ,{" "}
          <a href="/features/" className="text-accent underline">
            Features
          </a>
          ,{" "}
          <a href="/security/" className="text-accent underline">
            Security
          </a>
          , and{" "}
          <a href="/faq/" className="text-accent underline">
            FAQ
          </a>
          .
        </p>

        <CtaPair />
      </div>
    </>
  );
}
