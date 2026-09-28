const TRUE = new Set(["true", "1"]);

export function isProvisioningGatewayEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.PROVISIONING_GATEWAY_ENABLED;
  return value !== undefined && TRUE.has(value);
}
