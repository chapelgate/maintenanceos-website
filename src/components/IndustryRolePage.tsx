import { CtaPair } from "@/components/CtaPair";
import { GasSafetyBlock } from "@/components/GasSafetyBlock";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import {
  ukMaintenanceVsGeneric,
  type IndustryRole,
} from "@/config/industries";
import { getIndustrySeoIntent } from "@/config/seo-intents";
import { industryPageJsonLd } from "@/lib/json-ld";

type Props = { role: IndustryRole };

function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-ink font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderContent(lines: string[]) {
  const elements = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-2 text-muted">
          {currentList.map((li, i) => (
            <li key={i}>{parseBold(li.replace(/^- /, ''))}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('- ')) {
      currentList.push(line);
    } else {
      flushList();
      elements.push(<p key={`p-${i}`} className="text-muted">{parseBold(line)}</p>);
    }
  }
  flushList();

  return elements;
}

const GAS_BLOCK_SLUGS = new Set([
  "landlords",
  "letting-agents",
  "housing-associations",
  "councils",
]);

export function IndustryRolePage({ role }: Props) {
  const seo = getIndustrySeoIntent(role.slug);
  const hasDraftSections = Boolean(role.sections && role.sections.length > 0);
  return (
    <>
      <JsonLd data={industryPageJsonLd(role.slug)} />
      <PageHero
        eyebrow={`Industries · ${role.productName}`}
        title={role.title}
        lede={role.sub}
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        <p className="text-sm text-muted">
          <a href="/industries/#core-safety" className="font-medium text-accent underline-offset-4 hover:underline">
            Pre-launch status
          </a>
        </p>

        {GAS_BLOCK_SLUGS.has(role.slug) ? <GasSafetyBlock /> : null}

        {!hasDraftSections && (
        <>

        {seo ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">{seo.title}</h2>
            <p className="text-muted">{seo.summary}</p>
            <p className="text-sm text-muted">
              Core category:{" "}
              <a href="/property-maintenance-software/" className="text-accent underline">
                property maintenance software
              </a>
              .
            </p>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">
            UK maintenance — not a generic AI receptionist
          </h2>
          <p className="text-muted">
            Generic receptionist tools answer phones. {role.productName} is
            written for UK property-maintenance operations. Positioning only —
            voice remains in commissioning preview; not commercial general availability.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-muted">
            {ukMaintenanceVsGeneric.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {role.job && role.job.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">The job you are doing</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted">
              {role.job.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {role.fits && role.fits.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">
              How {role.productName} fits
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-muted">
              {role.fits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {role.safety && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">Safety and money boundaries</h2>
            <p className="text-muted">{role.safety}</p>
            <p className="text-sm text-muted">
              Trust and clearance:{" "}
              <a href="/security/" className="text-accent underline">
                Security
              </a>
              .
            </p>
          </section>
        )}

        {role.willNotClaim && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">What we will not claim</h2>
            <p className="text-muted">{role.willNotClaim}</p>
          </section>
        )}

        </>
        )}

        {role.sections?.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
            <div className="space-y-4">
              {renderContent(section.content)}
            </div>
          </section>
        ))}

        {role.faq && role.faq.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">Frequently asked questions</h2>
            <div className="space-y-3">
              {role.faq.map((item) => (
                <details key={item.q} className="mos-glass p-4" name="industry-faq">
                  <summary className="cursor-pointer font-semibold text-ink">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4 border-t border-border pt-8">
          <CtaPair
            primaryHref="/demo/"
            primaryLabel="Request an early demo"
            secondaryHref="/how-we-keep-control/"
            secondaryLabel="See the safety rules"
          />
          <p className="text-sm text-muted">
            <a href="/industries/" className="text-accent underline">
              All sectors
            </a>
          </p>
        </section>
      </div>
    </>
  );
}
