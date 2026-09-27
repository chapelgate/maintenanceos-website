import { validateAgentBlueprintV1 } from "../../../src/lib/agent-blueprint.ts";
import { validProvisioningEnvelope } from "../../provisioning-gateway/src/test-fixture.ts";
import type { AgentBlueprintV1 } from "../../../src/lib/agent-blueprint.ts";

export async function provisioningBlueprint(): Promise<AgentBlueprintV1> {
  const envelope = await validProvisioningEnvelope();
  const next = structuredClone(envelope.blueprint);
  next.lifecycle = { stage: "provisioning" };
  const validated = validateAgentBlueprintV1(next);
  if (!validated.ok) {
    throw new Error("fixture blueprint invalid");
  }
  return validated.value;
}
