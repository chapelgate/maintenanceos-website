import { CtaPair } from "@/components/CtaPair";
import { FeatureStatusChip } from "@/components/FeatureStatusChip";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { HonestyBanner } from "@/components/HonestyBanner";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SafeAutomationModel } from "@/components/SafeAutomationModel";
import {
  FEATURE_GROUPS,
  featureGroupCopy,
  isMarketingCardStatus,
  marketingCardsByGroup,
  UNDER_TEST_GROUP_HONESTY,
} from "@/config/phone-ai-features";
import { funnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata = funnelPageMetadata("features");

export default function FeaturesPage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("features")} />
      <PageHero
        eyebrow="Capability map · Pre-launch"
        title="What MaintenanceOS can do — and what is in preview"
        lede="Start with the operational outcomes: collect maintenance details, keep safety and approvals in rules, escalate cases for human review, and retain a reviewable record. The capability labels below separate VERIFIED source-backed features from PREVIEW work. Pre-launch — not a buy-now service or public always-on phone line."
        orbAccent
      />
      <SafeAutomationModel compact />
      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
        <FunnelPathStrip />
        <HonestyBanner compact>
          Seven cards we can stand behind today — five VERIFIED, two PREVIEW.
          Peer-common gaps stay off this page and are tracked with product.
        </HonestyBanner>

        {FEATURE_GROUPS.map((groupId) => {
          const group = featureGroupCopy[groupId];
          const cards = marketingCardsByGroup(groupId);
          if (cards.length === 0) return null;
          const hasUnderTest = cards.some((card) => card.status === "UNDER_TEST");
          return (
            <section key={groupId} className="space-y-4" aria-labelledby={`${groupId}-heading`}>
              <div>
                <h2
                  id={`${groupId}-heading`}
                  className="text-xl font-semibold text-ink"
                >
                  {group.heading}
                </h2>
                <p className="mt-1 text-sm text-muted">{group.lede}</p>
                {hasUnderTest ? (
                  <p className="mt-2 text-sm text-muted">{UNDER_TEST_GROUP_HONESTY}</p>
                ) : null}
              </div>
              <div
                className={
                  cards.length > 1
                    ? "grid gap-4 md:grid-cols-2"
                    : "grid gap-4"
                }
              >
                {cards.map((card) => {
                  if (!isMarketingCardStatus(card.status)) return null;
                  return (
                    <article key={card.id} className="mos-glass p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-ink">
                          {card.title}
                        </h3>
                        <FeatureStatusChip status={card.status} />
                      </div>
                      <p className="mt-3 text-sm text-ink">{card.ukOpsLine}</p>
                      {card.bullets && card.bullets.length > 0 ? (
                        <details className="feature-learn-more mt-3">
                          <summary>Learn more</summary>
                          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                            {card.bullets.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <CtaPair
          primaryHref="/create/"
          primaryLabel="Create from website"
          secondaryHref="/demo/#launch"
          secondaryLabel="Join launch list"
        />
      </div>
    </>
  );
}
