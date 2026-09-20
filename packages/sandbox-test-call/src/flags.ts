const TRUE = new Set(["true", "1"]);

function isTrue(value: string | undefined): boolean {
  return value !== undefined && TRUE.has(value);
}

/**
 * Master switch. Default off.
 * `SANDBOX_TEST_CALL_ENABLED` is the primary flag.
 * `ONBOARDING_SANDBOX_CALL` is accepted as a documented alias.
 */
export function isSandboxTestCallEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    isTrue(env.SANDBOX_TEST_CALL_ENABLED) || isTrue(env.ONBOARDING_SANDBOX_CALL)
  );
}
