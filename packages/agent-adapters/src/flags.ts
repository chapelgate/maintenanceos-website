const TRUE = new Set(["true", "1"]);

export function isAgentAdapterWebhookEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.AGENT_ADAPTER_WEBHOOKS_ENABLED;
  return value !== undefined && TRUE.has(value);
}
