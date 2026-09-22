import { CtaPair } from "@/components/CtaPair";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import {
  FEATURE_GROUPS,
  featureGroupCopy,
  isMarketingCardStatus,
  marketingCardsByGroup,
  marketingFeatureStatusLabel,
  PHONE_AI_INVENTORY_DOC,
  phoneAiNotClaimed,
  type MarketingCardStatus,
} from "@/config/phone-ai-features";
import { funnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata = funnelPageMetadata("features");

function StatusChip({ status }: { status: MarketingCardStatus }) {
  const label = marketingFeatureStatusLabel[status];
  const mark = status === "VERIFIED" ? "✓" : "○";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-paper px-2 py-0.5 text-xs font-semibold tracking-wide text-ink">
      <span aria-hidden="true">{mark}</span>
      {label}
    </span>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("features")} />
      <PageHero
        eyebrow="Capability map · Pre-launch"
        title="What MaintenanceOS includes — VERIFIED and UNDER TEST"
        lede="Short cards from the Phone AI inventory. VERIFIED is a product capability in source — still pre-launch, not a buy-now live service. UNDER TEST is designed or flagged — not general availability. Live phone stays not available. Nothing here claims commercial general availability or a public always-on phone line."
      />
      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12">
        {FEATURE_GROUPS.map((groupId) => {
          const group = featureGroupCopy[groupId];
          const cards = marketingCardsByGroup(groupId);
          if (cards.length === 0) return null;
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
              </div>
              <div className="grid gap-4">
                {cards.map((card) => {
                  if (!isMarketingCardStatus(card.status)) return null;
                  return (
                    <article key={card.id} className="mos-glass p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-ink">
                          {card.title}
                        </h3>
                        <StatusChip status={card.status} />
                      </div>
                      <p className="mt-3 text-sm text-ink">{card.ukOpsLine}</p>
                      {card.bullets && card.bullets.length > 0 ? (
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                          {card.bullets.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section aria-labelledby="not-claimed-heading">
          <h2 id="not-claimed-heading" className="text-xl font-semibold text-ink">
            Not claimed on this site
          </h2>
          <p className="mt-1 text-sm text-muted">
            NOT_ON_SITE / COMING — forbid list only. These are not present
            features.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            {phoneAiNotClaimed.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-muted">
          Voice detail:{" "}
          <a href="/ai-receptionist/" className="text-accent underline">
            AI receptionist
          </a>
          . Trust posture:{" "}
          <a href="/security/" className="text-accent underline">
            Security
          </a>
          . Funnel:{" "}
          <a href="/how-it-works/" className="text-accent underline">
            How it works
          </a>
          {" · "}
          <a href="/create/" className="text-accent underline">
            Create from website
          </a>
          .
        </p>
        <CtaPair
          primaryHref="/create/"
          primaryLabel="Create from website"
          secondaryHref="/demo/#launch"
          secondaryLabel="Join launch list"
        />
        <p className="text-xs text-muted">
          Internal inventory for product:{" "}
          <code>{PHONE_AI_INVENTORY_DOC}</code>
        </p>
      </div>
    </>
  );
}
