const TRUE = new Set(["true", "1"]);

export function isCustomerDashboardEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.CUSTOMER_DASHBOARD_ENABLED;
  return value !== undefined && TRUE.has(value);
}

/** When the dashboard is on, demo SAMPLE rows are served unless this is explicitly false. */
export function isCustomerDashboardDemoDataEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.CUSTOMER_DASHBOARD_DEMO_DATA;
  if (value === undefined || value === "") return true;
  return TRUE.has(value);
}

export function dashboardCatalogKindFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): "demo" | "empty" {
  return isCustomerDashboardDemoDataEnabled(env) ? "demo" : "empty";
}
