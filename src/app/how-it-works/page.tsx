import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "How it works" };

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Intake",
      body: "Requests arrive from residents, agents, or voice channels. Caller and property details are collected into structured work.",
    },
    {
      title: "Triage & rules",
      body: "Deterministic safety and lifecycle rules classify and route work. AI may assist with drafting and classification — it does not override safety rules.",
    },
    {
      title: "Human oversight",
      body: "Critical safety paths require human clearance. Escalation queues keep people in the loop before consequential dispatch or commitments.",
    },
    {
      title: "Accountable execution",
      body: "Jobs, communications, and audit evidence stay tied to the work order so operations remain clear and reviewable.",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Operations flow"
        title="How MaintenanceOS is designed to work"
        lede="From intake to accountable execution — with deterministic safety rules ahead of AI assistance. Capabilities described here are designed and under testing, not commercially generally available."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ol className="space-y-8">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-ink">{step.title}</h2>
                <p className="mt-2 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <CtaPair className="mt-12" />
      </div>
    </>
  );
}
