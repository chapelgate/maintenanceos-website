import type { AgentBlueprintV1 } from "@/lib/agent-blueprint";
import {
  CUSTOMER_VOICE_PROFILES,
  customerActionOptionsForBlueprint,
  customerTransferSupported,
  type CustomerAgentConfiguration,
  type CustomerActionId,
  type CustomerVoiceProfile,
} from "@/lib/agent-customer-configuration";

export function AgentCustomerConfiguration({
  blueprint,
  configuration,
  onChange,
}: {
  blueprint: AgentBlueprintV1;
  configuration: CustomerAgentConfiguration;
  onChange: (configuration: CustomerAgentConfiguration) => void;
}) {
  const actions = customerActionOptionsForBlueprint(blueprint);
  const transferSupported = customerTransferSupported(blueprint);

  function setVoiceProfile(voiceProfile: CustomerVoiceProfile) {
    onChange({ ...configuration, voiceProfile });
  }

  function setAction(action: CustomerActionId, enabled: boolean) {
    const next = new Set(configuration.enabledActions);
    if (enabled) next.add(action);
    else next.delete(action);
    onChange({ ...configuration, enabledActions: [...next] });
  }

  return (
    <section
      className="rounded-md border border-border bg-paper p-5"
      aria-labelledby="agent-configuration-heading"
    >
      <h2
        id="agent-configuration-heading"
        className="text-lg font-semibold text-ink"
      >
        Configure this agent
      </h2>
      <p className="mt-2 text-sm text-muted">
        These controls update the reviewed website configuration only. They do
        not provision a number, change a carrier route, or alter a live phone
        line.
      </p>

      <fieldset className="mt-5">
        <legend className="font-medium text-ink">Voice preference</legend>
        <p className="mt-1 text-xs text-muted">
          This records a preference for later commissioning. It does not select
          or change a live production voice.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CUSTOMER_VOICE_PROFILES.map((profile) => (
            <label
              key={profile.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface p-3"
            >
              <input
                type="radio"
                name="customer-voice-profile"
                value={profile.id}
                aria-label={profile.label}
                checked={configuration.voiceProfile === profile.id}
                onChange={() => setVoiceProfile(profile.id)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-ink">
                  {profile.label}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {profile.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-medium text-ink">What this role may handle</legend>
        <p className="mt-1 text-xs text-muted">
          General business questions and taking messages stay included. The
          options below can only narrow the actions already approved for the
          selected role.
        </p>
        {actions.length ? (
          <div className="mt-3 space-y-2">
            {actions.map((action) => (
              <label
                key={action.id}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface p-3"
              >
                <input
                  type="checkbox"
                  aria-label={action.label}
                  checked={configuration.enabledActions.includes(action.id)}
                  onChange={(event) =>
                    setAction(action.id, event.currentTarget.checked)
                  }
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {action.label}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {action.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            This role has no additional action group to switch on or off.
          </p>
        )}
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-medium text-ink">Human transfer</legend>
        {transferSupported ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface p-3">
              <input
                type="radio"
                name="customer-human-transfer"
                value="explicit_request"
                aria-label="When the caller asks"
                checked={configuration.humanTransfer === "explicit_request"}
                onChange={() =>
                  onChange({
                    ...configuration,
                    humanTransfer: "explicit_request",
                  })
                }
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-ink">
                  When the caller asks
                </span>
                <span className="mt-1 block text-xs text-muted">
                  Permit transfer only after an explicit request for a person.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface p-3">
              <input
                type="radio"
                name="customer-human-transfer"
                value="disabled"
                aria-label="No transfer"
                checked={configuration.humanTransfer === "disabled"}
                onChange={() =>
                  onChange({ ...configuration, humanTransfer: "disabled" })
                }
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-ink">
                  No transfer
                </span>
                <span className="mt-1 block text-xs text-muted">
                  Keep human transfer disabled for this configuration.
                </span>
              </span>
            </label>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Human transfer is not included in the selected role&apos;s approved
            capability set.
          </p>
        )}
      </fieldset>
    </section>
  );
}
