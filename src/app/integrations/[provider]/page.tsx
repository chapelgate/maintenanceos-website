import { notFound } from "next/navigation";
import { getProviderConfig, getAllProviders, generateAuthUrl, isProviderAvailable, type IntegrationProviderId } from "@/lib/integrations";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import Link from "next/link";

interface ProviderPageProps {
  params: Promise<{ provider: string }>;
}

export async function generateStaticParams() {
  const providers = getAllProviders();
  return providers.map((p) => ({ provider: p.id }));
}

export async function generateMetadata({ params }: ProviderPageProps) {
  const resolvedParams = await params;
  const config = getProviderConfig(resolvedParams.provider as IntegrationProviderId);

  if (!config) {
    return contentPageMetadata({
      title: "Integration Not Found",
      description: "The requested integration page does not exist.",
      path: "/404",
    });
  }

  return contentPageMetadata({
    title: `${config.name} Integration`,
    description: `Connect ${config.name} with MaintenanceOS. ${config.description}`,
    path: `/integrations/${config.id}/`,
  });
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const resolvedParams = await params;
  const providerId = resolvedParams.provider as IntegrationProviderId;
  const config = getProviderConfig(providerId);

  if (!config) {
    notFound();
  }

  const pagePath = `/integrations/${config.id}/`;
  const breadcrumbLabels = [
    { name: "Integrations", path: "/integrations/" },
    { name: config.name, path: pagePath },
  ];

  const jsonLdData = contentPageJsonLd(
    pagePath,
    `${config.name} Integration`,
    `Connect ${config.name} with MaintenanceOS. ${config.description}`,
    breadcrumbLabels,
  );

  const isAvailable = isProviderAvailable(config.id);
  const authUrl = isAvailable ? await generateAuthUrl(config.id, "integrations-page") : null;

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageHero
        eyebrow="Integration"
        title={`${config.name} Integration`}
        lede={config.description}
      />

      <section className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-xl bg-paper"
              aria-hidden="true"
            >
              <div
                className="h-10 w-10 bg-cover bg-center"
                style={{ backgroundImage: `url(${config.logo})` }}
                role="img"
                aria-label={config.name}
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-ink">{config.name}</h2>
              <p className="mt-1 text-muted">{config.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  isAvailable
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                }`}>
                  {isAvailable ? "Available" : "Coming Soon"}
                </span>
                <span className="inline-flex items-center rounded-full bg-paper px-3 py-1 text-sm font-medium text-muted capitalize">
                  {config.category}
                </span>
              </div>
            </div>
          </div>

          {isAvailable && authUrl && (
            <div className="pt-4 border-t border-border">
              <a
                href={authUrl}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Connect {config.name}
              </a>
              <p className="mt-2 text-sm text-muted">
                You will be redirected to {config.name} to authorize the connection.
              </p>
            </div>
          )}

          {!isAvailable && (
            <div className="pt-4 border-t border-border">
              <form action="/contact/" method="GET" className="space-y-4">
                <input type="hidden" name="subject" value={`Integration request: ${config.name}`} />
                <input type="hidden" name="message" value={`I&apos;m interested in the ${config.name} integration for MaintenanceOS. Please notify me when it&apos;s available.`} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-ink hover:border-accent"
                >
                  Notify me when available
                </button>
                <p className="text-sm text-muted">
                  We&apos;ll email you when this integration is ready.
                </p>
              </form>
            </div>
          )}
        </div>

        {config.setupSteps && config.setupSteps.length > 0 && (
          <section aria-labelledby="setup-heading" className="space-y-6">
            <h2 id="setup-heading" className="text-xl font-semibold text-ink">
              Setup steps
            </h2>
            <ol className="space-y-4">
              {config.setupSteps.map((step, i) => (
                <li key={i} className="relative flex gap-4 rounded-[var(--mos-radius-lg)] border border-border bg-surface p-4">
                  <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold">
                    {i + 1}
                  </span>
                  <div className="flex-1 pt-1">
                    <p className="text-sm text-ink">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section aria-labelledby="scopes-heading" className="space-y-6">
          <h2 id="scopes-heading" className="text-xl font-semibold text-ink">
            Requested permissions
          </h2>
          <p className="text-sm text-muted">
            We only request the minimum scopes needed for the integration to function.
          </p>
          <ul className="space-y-2" role="list">
            {config.scopes.map((scope, i) => (
              <li key={i} className="rounded-[var(--mos-radius-md)] border border-border bg-surface px-3 py-2 text-sm font-mono text-muted">
                {scope.replace(/'/g, "&apos;")}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="security-heading" className="border-t border-border pt-8 space-y-4">
          <h2 id="security-heading" className="text-xl font-semibold text-ink">
            Security & privacy
          </h2>
          <ul className="space-y-3 text-sm text-muted list-disc list-inside">
            <li>Tokens encrypted at rest using AES-256-GCM</li>
            <li>Short-lived access tokens; automatic refresh via stored refresh tokens</li>
            <li>Minimal scopes requested — only what&apos;s needed for each integration</li>
            <li>Revoke access anytime from this page or the provider&apos;s dashboard</li>
            <li>No credential storage in browser — all OAuth handled server-side</li>
          </ul>
        </section>

        <nav aria-label="Breadcrumb" className="border-t border-border pt-8">
          <ol className="flex items-center gap-2 text-sm text-muted" role="list">
            <li>
              <Link href="/integrations/" className="hover:text-accent underline underline-offset-2">
                Integrations
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {config.name}
            </li>
          </ol>
        </nav>
      </section>
    </>
  );
}