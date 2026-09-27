import type { AgentBlueprintV1 } from "@/lib/agent-blueprint";
import type { AgentReviewRequirement } from "@/lib/agent-review";
import { agentTemplateFor } from "@/lib/agent-selection";

function capabilityLabel(value: string): string {
  return value.replaceAll("_", " ");
}

export function AgentReviewGate({
  blueprint,
  requirements,
  confirmedIds,
  onToggle,
  disabled = false,
}: {
  blueprint: AgentBlueprintV1;
  requirements: AgentReviewRequirement[];
  confirmedIds: readonly string[];
  onToggle: (id: string, checked: boolean) => void;
  disabled?: boolean;
}) {
  const confirmed = new Set(confirmedIds);
  const enabledIntegrations = blueprint.integrations.filter((item) => item.enabled);

  return (
    <section
      className="rounded-lg border border-border bg-paper p-4"
      aria-labelledby="agent-review-heading"
      data-agent-review-gate=""
      aria-busy={disabled || undefined}
    >
      <h3 id="agent-review-heading" className="text-base font-semibold text-ink">
        Final customer review
      </h3>
      <p className="mt-1 text-sm text-muted">
        Review the AI configuration before submitting it for early access.
        Required confirmations fail closed; they do not activate or provision anything.
      </p>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-ink">Business name</dt>
          <dd className="text-muted">{blueprint.identity.businessName}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Business website</dt>
          <dd className="break-all text-muted">{blueprint.identity.website}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Locations</dt>
          <dd className="text-muted">
            {blueprint.identity.locations?.length
              ? blueprint.identity.locations.join(", ")
              : "Not on file"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Contact details</dt>
          <dd className="text-muted">
            {blueprint.identity.contact?.phone ||
            blueprint.identity.contact?.email
              ? [
                  blueprint.identity.contact?.phone,
                  blueprint.identity.contact?.email,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : "Not on file"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Agent role</dt>
          <dd className="text-muted">
            {agentTemplateFor(blueprint.agent.type).label}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Human transfer</dt>
          <dd className="text-muted">
            {blueprint.rules.humanTransfer.replaceAll("_", " ")}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-ink">Purpose</dt>
          <dd className="text-muted">{blueprint.agent.objective}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Blueprint allowed capabilities</dt>
          <dd className="text-muted">
            {blueprint.permissions.allow.length
              ? blueprint.permissions.allow.map(capabilityLabel).join(", ")
              : "None"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Blueprint denied capabilities</dt>
          <dd className="text-muted">
            {blueprint.permissions.deny.length
              ? blueprint.permissions.deny.map(capabilityLabel).join(", ")
              : "None"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Unavailable-information rule</dt>
          <dd className="text-muted">
            {blueprint.rules.unavailableInformation.replaceAll("_", " ")}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Forbidden actions</dt>
          <dd className="text-muted">
            {blueprint.rules.forbiddenActions.length
              ? blueprint.rules.forbiddenActions
                  .map(capabilityLabel)
                  .join(", ")
              : "None"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Enabled integrations</dt>
          <dd className="text-muted">
            {enabledIntegrations.length
              ? enabledIntegrations.map((item) => item.kind).join(", ")
              : "None"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Call-data settings</dt>
          <dd className="text-muted">
            Recording {blueprint.privacy.recordCalls ? "on" : "off"}; transcription{" "}
            {blueprint.privacy.transcribeCalls ? "on" : "off"}; retention{" "}
            {blueprint.privacy.retentionDays} days.
          </dd>
        </div>
      </dl>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink">
          Required confirmations
        </legend>
        <div className="mt-2 space-y-2">
          {requirements.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer gap-3 rounded-md border border-border bg-surface p-3 text-sm"
              data-review-requirement={item.id}
            >
              <input
                type="checkbox"
                checked={confirmed.has(item.id)}
                disabled={disabled}
                onChange={(event) => onToggle(item.id, event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-ink">{item.title}</span>
                <span className="mt-0.5 block text-muted">{item.detail}</span>
                <span className="mt-1 block text-xs uppercase tracking-wide text-muted">
                  {item.kind.replaceAll("_", " ")}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
