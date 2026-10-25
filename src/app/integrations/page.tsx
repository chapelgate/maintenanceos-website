import { getAllProviders } from "@/lib/integrations";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import Link from "next/link";

export const metadata = contentPageMetadata({
  title: "Integrations",
  description: "Coming soon: Calendar, scheduling, automation, and CRM integrations for MaintenanceOS.",
  path: "/integrations/",
});

function ProviderCard({
  provider,
}: {
  provider: {
    id: string;
    name: string;
    logo: string;
    description: string;
    category: string;
    status: string;
    setupSteps?: string[];
  };
}) {
  const isAvailable = provider.status === "available";
  const statusLabel = isAvailable ? "Available" : "Coming Soon";
  const statusClass = isAvailable
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";

  return (
    <article className="relative rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 space-y-4 transition-shadow hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-paper"
          aria-hidden="true"
        >
          <div
            className="h-8 w-8 bg-cover bg-center"
            style={{ backgroundImage: `url(${provider.logo})` }}
            role="img"
            aria-label={provider.name}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-ink truncate">{provider.name}</h3>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted line-clamp-2">{provider.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-muted capitalize">
              {provider.category}
            </span>
          </div>
        </div>
      </div>

      {provider.setupSteps && provider.setupSteps.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-1.5 text-sm text-accent cursor-pointer list-none">
            <span>Setup steps</span>
            <svg className="flex-shrink-0 h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
            </svg>
          </summary>
          <ol className="mt-3 space-y-2 text-sm text-muted pl-4 list-decimal">
            {provider.setupSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </details>
      )}

      <div className="pt-2">
        <Link
          href={isAvailable ? `/integrations/${provider.id}/` : "#"}
          className={`inline-flex w-full min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            isAvailable
              ? "bg-accent text-on-accent hover:bg-accent-hover"
              : "border border-border bg-surface text-ink cursor-not-allowed"
          }`}
          aria-disabled={!isAvailable}
        >
          {isAvailable ? "Connect" : "Notify me when available"}
        </Link>
      </div>
    </article>
  );
}

export default function IntegrationsPage() {
  const providers = getAllProviders();

  const jsonLdData = contentPageJsonLd(
    "/integrations/",
    "Integrations",
    "Coming soon: Calendar, scheduling, automation, and CRM integrations for MaintenanceOS.",
    [
      { name: "Integrations", path: "/integrations/" },
    ],
  );

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageHero
        eyebrow="Product"
        title="Integrations"
        lede="Coming soon: Calendar, scheduling, automation, and CRM integrations for MaintenanceOS."
      />
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <FunnelPathStrip linked />

        <section aria-labelledby="providers-heading" className="space-y-6">
          <h2 id="providers-heading" className="sr-only">
            Available integrations
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>

        <section aria-labelledby="how-it-works" className="border-t border-border pt-8 space-y-6">
          <h2 id="how-it-works" className="text-xl font-semibold text-ink">
            How integrations work
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent" aria-hidden="true">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-ink">Connect securely</h3>
              <p className="text-sm text-muted">OAuth 2.0 flow with encrypted token storage.</p>
            </div>
            <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent" aria-hidden="true">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-ink">Configure once</h3>
              <p className="text-sm text-muted">Map fields, set sync rules, and choose which events trigger actions in each direction.</p>
            </div>
            <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent" aria-hidden="true">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-ink">Automate with confidence</h3>
              <p className="text-sm text-muted">Full audit log of every sync. Human clearance required for safety-critical actions.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="security" className="border-t border-border pt-8 space-y-4">
          <h2 id="security" className="text-xl font-semibold text-ink">
            Security & privacy
          </h2>
          <ul className="space-y-3 text-sm text-muted list-disc list-inside">
            <li>Tokens encrypted at rest using AES-256-GCM</li>
            <li>Short-lived access tokens; automatic refresh via stored refresh tokens</li>
            <li>Minimal scopes requested — only what&apos;s needed for each integration</li>
            <li>Revoke access anytime from this page or the provider&apos;s dashboard</li>
          </ul>
        </section>

        <section aria-labelledby="coming-soon" className="border-t border-border pt-8 space-y-4">
          <h2 id="coming-soon" className="text-xl font-semibold text-ink">
            Coming soon
          </h2>
          <p className="text-sm text-muted">
            We&apos;re actively working on Google Calendar, Outlook, Cal.com, Calendly, Zapier, and HubSpot integrations.
            <Link href="/contact/" className="text-accent underline underline-offset-2 hover:text-accent/80">
              Contact us
            </Link>
            {" to be notified when they&apos;re available or to request a specific integration."}
          </p>
        </section>
      </div>
    </>
  );
}