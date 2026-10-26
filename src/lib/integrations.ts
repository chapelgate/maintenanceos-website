export type IntegrationProviderId =
  | "google"
  | "outlook"
  | "calcom"
  | "calendly"
  | "zapier"
  | "hubspot";

export type IntegrationStatus = "available" | "coming-soon" | "deprecated";

export interface ProviderConfig {
  id: IntegrationProviderId;
  name: string;
  logo: string;
  description: string;
  category: "calendar" | "automation" | "crm";
  status: IntegrationStatus;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  /** Full redirect URL for OAuth callback (handled by DO Function) */
  redirectUrl: string;
  setupSteps?: string[];
}

/** Get the base URL for OAuth callbacks (DO Function endpoint). */
export function getOAuthCallbackBaseUrl(): string {
  return process.env.NEXT_PUBLIC_OAUTH_CALLBACK_BASE_URL ?? "https://api.worksmartos.co.uk/v1/integrations";
}

const PROVIDER_CONFIGS: Record<IntegrationProviderId, ProviderConfig> = {
  google: {
    id: "google",
    name: "Google Calendar",
    logo: "/logos/google.svg",
    description: "Planned: sync MaintenanceOS repair schedules with Google Calendar when this connector ships. Not a live connector.",
    category: "calendar",
    status: "coming-soon",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    redirectUrl: `${getOAuthCallbackBaseUrl()}/google/callback`,
    setupSteps: [
      "Create a Google Cloud project",
      "Enable Google Calendar API",
      "Configure OAuth consent screen",
      "Add authorized redirect URI",
    ],
  },
  outlook: {
    id: "outlook",
    name: "Outlook Calendar",
    logo: "/logos/outlook.svg",
    description: "Planned: Microsoft 365 / Outlook Calendar sync for repair appointments when this connector ships. Not a live connector.",
    category: "calendar",
    status: "coming-soon",
    authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: ["https://graph.microsoft.com/Calendars.ReadWrite", "offline_access"],
    clientIdEnv: "OUTLOOK_CLIENT_ID",
    clientSecretEnv: "OUTLOOK_CLIENT_SECRET",
    redirectUrl: `${getOAuthCallbackBaseUrl()}/outlook/callback`,
    setupSteps: [
      "Register app in Azure Portal",
      "Add Calendar.ReadWrite permission",
      "Configure redirect URI",
      "Grant admin consent if required",
    ],
  },
  calcom: {
    id: "calcom",
    name: "Cal.com",
    logo: "/logos/calcom.svg",
    description: "Planned: Cal.com scheduling links for repair appointments when this connector ships. Not a live connector.",
    category: "calendar",
    status: "coming-soon",
    authUrl: "https://app.cal.com/oauth/authorize",
    tokenUrl: "https://app.cal.com/oauth/token",
    scopes: ["scheduling.read", "scheduling.write", "booking.read", "booking.write"],
    clientIdEnv: "CALCOM_CLIENT_ID",
    clientSecretEnv: "CALCOM_CLIENT_SECRET",
    redirectUrl: `${getOAuthCallbackBaseUrl()}/calcom/callback`,
    setupSteps: [
      "Create Cal.com OAuth app",
      "Configure redirect URI",
      "Enable scheduling permissions",
    ],
  },
  calendly: {
    id: "calendly",
    name: "Calendly",
    logo: "/logos/calendly.svg",
    description: "Planned: Calendly scheduling for maintenance visits when this connector ships. Not a live connector.",
    category: "calendar",
    status: "coming-soon",
    authUrl: "https://auth.calendly.com/oauth/authorize",
    tokenUrl: "https://auth.calendly.com/oauth/token",
    scopes: ["scheduling:read", "scheduling:write", "user:read", "webhook:write"],
    clientIdEnv: "CALENDLY_CLIENT_ID",
    clientSecretEnv: "CALENDLY_CLIENT_SECRET",
    redirectUrl: `${getOAuthCallbackBaseUrl()}/calendly/callback`,
    setupSteps: [
      "Create Calendly OAuth app",
      "Configure redirect URI",
      "Enable scheduling scopes",
    ],
  },
  zapier: {
    id: "zapier",
    name: "Zapier",
    logo: "/logos/zapier.svg",
    description: "Planned: Zapier workflows for repair-report triggers when this connector ships. No app-count claim; not a live connector.",
    category: "automation",
    status: "coming-soon",
    authUrl: "https://zapier.com/oauth/authorize",
    tokenUrl: "https://zapier.com/oauth/token",
    scopes: ["zaps:read", "zaps:write", "triggers:read", "actions:write"],
    clientIdEnv: "ZAPIER_CLIENT_ID",
    clientSecretEnv: "ZAPIER_CLIENT_SECRET",
    redirectUrl: `${getOAuthCallbackBaseUrl()}/zapier/callback`,
    setupSteps: [
      "Create Zapier integration (private or public)",
      "Configure OAuth redirect",
      "Define triggers and actions",
    ],
  },
  hubspot: {
    id: "hubspot",
    name: "HubSpot",
    logo: "/logos/hubspot.svg",
    description: "Planned: HubSpot CRM sync for repair contacts when this connector ships. Not a live connector.",
    category: "crm",
    status: "coming-soon",
    authUrl: "https://app.hubspot.com/oauth/authorize",
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    scopes: [
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
      "crm.objects.deals.read",
      "crm.objects.deals.write",
      "oauth",
    ],
    clientIdEnv: "HUBSPOT_CLIENT_ID",
    clientSecretEnv: "HUBSPOT_CLIENT_SECRET",
    redirectUrl: `${getOAuthCallbackBaseUrl()}/hubspot/callback`,
    setupSteps: [
      "Create HubSpot app in developer account",
      "Add CRM scopes",
      "Configure redirect URL",
      "Submit for review if public",
    ],
  },
};

export function getProviderConfig(id: IntegrationProviderId): ProviderConfig {
  const config = PROVIDER_CONFIGS[id];
  if (!config) {
    throw new Error(`Unknown integration provider: ${id}`);
  }
  return config;
}

export function getAllProviders(): ProviderConfig[] {
  return Object.values(PROVIDER_CONFIGS).sort((a, b) => a.name.localeCompare(b.name));
}

export async function generateAuthUrl(providerId: IntegrationProviderId, state: string): Promise<string> {
  const config = getProviderConfig(providerId);
  const redirectUri = config.redirectUrl;

  const params = new URLSearchParams({
    client_id: process.env[config.clientIdEnv] ?? "",
    redirect_uri: redirectUri,
    scope: config.scopes.join(" "),
    response_type: "code",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  // Provider-specific adjustments
  if (providerId === "outlook") {
    params.delete("access_type");
    params.delete("prompt");
  }
  if (providerId === "hubspot") {
    params.delete("access_type");
    params.delete("prompt");
  }
  if (providerId === "zapier") {
    params.delete("access_type");
    params.delete("prompt");
  }

  return `${config.authUrl}?${params.toString()}`;
}

export function isProviderAvailable(providerId: IntegrationProviderId): boolean {
  const config = getProviderConfig(providerId);
  return config.status === "available" && !!(process.env[config.clientIdEnv] && process.env[config.clientSecretEnv]);
}