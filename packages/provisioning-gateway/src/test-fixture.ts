import { buildAgentConfiguration } from "../../../src/lib/agent-configuration.ts";
import {
  agentReviewRevision,
  buildAgentReviewRecord,
  buildAgentReviewRequirements,
} from "../../../src/lib/agent-review.ts";
import {
  qualifyAgentSandbox,
  type AgentSandboxReviewSubject,
} from "../../../src/lib/agent-sandbox-qualification.ts";
import { buildAgentBlueprintDraft } from "../../../src/lib/agent-selection.ts";
import {
  requestSandboxScriptedDemo,
  resetBrowserSandboxMock,
} from "../../../src/lib/sandbox-test-call.ts";
import type { ProvisioningRequestInput } from "./types.ts";

export async function validProvisioningEnvelope(input: {
  tenantRef?: string;
  greeting?: string;
  blueprintId?: string;
  agentType?: Parameters<typeof buildAgentBlueprintDraft>[0]["type"];
} = {}): Promise<ProvisioningRequestInput> {
  const draft = {
    businessName: "Acme Plumbing",
    greeting:
      input.greeting ?? "Thank you for calling Acme Plumbing. How can I help?",
    hours: "Mon-Fri 08:00-17:00",
    services: "Boiler repair\nHeating maintenance",
    faqs: "Q: Do you cover Wirral?\nA: Yes.",
  };
  const selected = buildAgentBlueprintDraft({
    type: input.agentType ?? "maintenance_desk",
    businessName: draft.businessName,
    businessUrl: "https://acme.example/",
    facts: {
      website: "https://acme.example/",
      businessName: draft.businessName,
      locations: ["Wirral"],
      contact: {
        phones: ["0151 555 0100"],
        emails: ["hello@acme.example"],
      },
      services: ["Boiler repair", "Heating maintenance"],
      hours: draft.hours,
      faqs: [{ question: "Do you cover Wirral?", answer: "Yes." }],
    },
    blueprintId: input.blueprintId ?? "abp_step8test0001",
    createdAt: "2026-09-27T18:20:00.000Z",
  });
  const configuration = buildAgentConfiguration({
    blueprint: selected,
    reviewedDraft: draft,
  });
  const requirements = buildAgentReviewRequirements({
    blueprint: configuration.blueprint,
    missing: configuration.knowledgePack.missing,
  });
  const revisionId = agentReviewRevision({
    blueprint: configuration.blueprint,
    knowledgePack: configuration.knowledgePack,
    systemPrompt: configuration.systemPrompt,
    missing: configuration.knowledgePack.missing,
  });
  const reviewRecord = buildAgentReviewRecord(
    requirements,
    requirements.map((item) => item.id),
    revisionId,
  );
  const review: AgentSandboxReviewSubject = {
    blueprint: configuration.blueprint,
    knowledgePack: configuration.knowledgePack,
    systemPrompt: configuration.systemPrompt,
    missing: configuration.knowledgePack.missing,
    reviewRecord,
  };

  resetBrowserSandboxMock();
  const demo = await requestSandboxScriptedDemo({
    enabled: true,
    endpoint: "",
    draft,
    knowledgePack: configuration.knowledgePack,
    systemPrompt: configuration.systemPrompt,
  });
  if (demo.status !== "ok") throw new Error("sandbox fixture failed");

  const qualified = qualifyAgentSandbox({
    review,
    source: "companion",
    session: demo.data.session,
    test: demo.data.test,
  });

  return {
    tenantRef: input.tenantRef ?? "tenant_acme",
    blueprint: qualified.blueprint,
    qualification: qualified.record,
    evidence: {
      review,
      session: demo.data.session,
      test: demo.data.test,
    },
  } as unknown as ProvisioningRequestInput;
}
