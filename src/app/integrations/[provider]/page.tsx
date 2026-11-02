import { notFound } from "next/navigation";
import { getProviderConfig, getAllProviders, generateAuthUrl, isProviderAvailable, type IntegrationProviderId } from "@/lib/integrations";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { PreLaunchRecoveryNav } from "@/components/PreLaunchRecoveryNav";
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

  const statusNote =
    config.status === "available"
      ? `Connect ${config.name} with MaintenanceOS.`
      : `${config.name} integration is coming soon — not a live connector.`;
  return contentPageMetadata({
    title: `${config.name} Integration`,
    description: `${statusNote} ${config.description}`,
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

  const statusBlurb =
    config.status === "available"
      ? `Connect ${config.name} with MaintenanceOS.`
      : `${config.name} integration is coming soon — not a live connector.`;
  const jsonLdData = contentPageJsonLd(
    pagePath,
    `${config.name} Integration`,
    `${statusBlurb} ${config.description}`,
    breadcrumbLabels,
  );

  const isAvailable = isProviderAvailable(config.id);
  const authUrl = isAvailable ? await generateAuthUrl(config.id, "integrations-page") : null;
  const isComingSoon = config.status === "coming-soon";

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageHero
        eyebrow={isComingSoon ? "Integration (planned)" : "Integration"}
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

          {!isAvailable && isComingSoon && (
            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-sm text-muted">
                This integration is coming soon — not a live connector on this site.
              </p>
              <Link
                href={`/contact/?subject=${encodeURIComponent(`Integration enquiry: ${config.name}`)}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-ink hover:border-accent"
              >
                Ask about this integration
              </Link>
              <p className="text-sm text-muted">
                Contact is a human enquiry path. This site does not send automated availability emails.
              </p>
            </div>
          )}
        </div>

        {config.setupSteps && config.setupSteps.length > 0 && (
          <section aria-labelledby="setup-heading" className="space-y-6">
            <h2 id="setup-heading" className="text-xl font-semibold text-ink">
              {isAvailable ? "Setup steps" : "Planned setup steps"}
            </h2>
            {!isAvailable && (
              <p className="text-sm text-muted">
                These steps describe the intended flow when the connector ships. They are not live instructions on this site.
              </p>
            )}
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
            {isAvailable
              ? "We only request the minimum scopes needed for the integration to function."
              : "Planned scopes for when the connector ships — not an active OAuth grant from this page."}
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
            <li>Planned design: short-lived tokens held server-side when a connector ships</li>
            <li>Planned design: minimal scopes only</li>
            <li>No revoke control on this page today — connector is coming soon</li>
            <li>No AES-256-GCM or live OAuth claim is proved by this marketing page</li>
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

        <PreLaunchRecoveryNav
          links={[
            { href: "/integrations/", label: "Integrations" },
            { href: "/help/", label: "Help" },
            { href: "/security/", label: "Security" },
            { href: "/contact/", label: "Contact" },
          ]}
          note="Integration preview only — not a live connector desk, and not a live phone."
        />
      </section>
    </>
  );
}