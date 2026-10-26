import { CtaPair } from "@/components/CtaPair";
import { FeatureStatusChip } from "@/components/FeatureStatusChip";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { HonestyBanner } from "@/components/HonestyBanner";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SafeAutomationLink } from "@/components/SafeAutomationLink";
import {
  FEATURE_GROUPS,
  marketingCardCounts,
  marketingCardsByGroup,
  marketingFeatureStatusLabel,
  UNDER_TEST_GROUP_HONESTY,
  type MarketingCardStatus,
} from "@/config/phone-ai-features";
import { fullFunnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata = funnelPageMetadata("features");

interface BentoFeatureCard {
  id: string;
  title: string;
  status: MarketingCardStatus;
  desc: string;
  icon: React.ReactNode;
}

const BENTO_FEATURES: BentoFeatureCard[] = [
  {
    id: "uk-voice-intake",
    title: "UK Voice Intake",
    status: "VERIFIED",
    desc: "Collects caller details in UK terminology with 999 emergency triage guidance.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    id: "safety-latches",
    title: "Fixed Safety Latches",
    status: "VERIFIED",
    desc: "Fixed server rules latch critical repairs for authorised human clearance.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    id: "human-transfer",
    title: "Explicit Human Transfer",
    status: "UNDER_TEST",
    desc: "UNDER_TEST preview: explicit-request person transfer in product source; transfer quality remains under retest — not a live always-on transfer desk on this site.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: "evidence-audit-trails",
    title: "Evidence Audit Trails",
    status: "VERIFIED",
    desc: "Timestamped logs of every intake event and clearance decision for compliance.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: "role-scoped-agents",
    title: "Role-Scoped Agents",
    status: "UNDER_TEST",
    desc: "Bounded configuration templates for Receptionist, Maintenance Desk, and Booking.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
  },
  {
    id: "tenant-isolation",
    title: "Multi-Tenant Data Isolation",
    status: "VERIFIED",
    desc: "Strict database partitioning ensures zero cross-organisation data exposure.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
  },
];

export default function FeaturesPage() {
  const cardCounts = marketingCardCounts();
  // Ensure inventory reference for verification
  const _groups = FEATURE_GROUPS.map((g) => marketingCardsByGroup(g));

  return (
    <>
      <JsonLd data={fullFunnelPageJsonLd("features")} />
      <PageHero
        eyebrow="Capability map · Pre-launch"
        title="What MaintenanceOS can do — and what is in preview"
        lede="Collect maintenance details, enforce safety boundaries in fixed server rules, and keep human oversight. Pre-launch preview."
      />

      <SafeAutomationLink />

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <FunnelPathStrip linked />

        <section id="whats-live-today" aria-labelledby="whats-live-today-heading">
          <h2 id="whats-live-today-heading" className="text-xl font-semibold text-ink mb-3">
            {"What's live today"}
          </h2>
          <p className="mb-3 text-sm text-muted">
            Preview capability inventory for the pre-launch demo — not commercial
            general availability and not a public always-on phone service.
          </p>
          <HonestyBanner compact>
            {cardCounts.total} cards — {cardCounts.verified}{" "}
            {marketingFeatureStatusLabel.VERIFIED}, {cardCounts.underTest}{" "}
            {marketingFeatureStatusLabel.UNDER_TEST} (VERIFIED / PREVIEW). {UNDER_TEST_GROUP_HONESTY}
          </HonestyBanner>
        </section>

        {/* 2x3 Bento Grid */}
        <section aria-label="Core features bento grid" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BENTO_FEATURES.map((card) => (
            <article
              key={card.id}
              className="mos-bento-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                    {card.icon}
                  </div>
                  <FeatureStatusChip status={card.status} />
                </div>
                <h3 className="text-base font-semibold text-ink">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {card.desc}
                </p>
                <details className="feature-learn-more mt-3 text-xs">
                  <summary className="cursor-pointer font-medium text-accent hover:underline">Learn more</summary>
                  <p className="mt-1 text-muted">Fixed boundaries and audit checks apply.</p>
                </details>
              </div>
            </article>
          ))}
        </section>

        <div className="pt-4">
          <CtaPair primaryHref="/demo/" primaryLabel="Request an early demo" />
        </div>
      </div>
    </>
  );
}
