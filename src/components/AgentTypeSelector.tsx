import { AGENT_TEMPLATES } from "@/lib/agent-selection";
import type { AgentType } from "@/lib/agent-blueprint";

export function AgentTypeSelector({
  selected,
  onSelect,
}: {
  selected: AgentType | null;
  onSelect: (type: AgentType) => void;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-semibold text-ink">
        What do you want your AI to do?
      </legend>
      <p className="mt-2 text-sm text-muted">
        Choose one starting role. On the next step you can configure its voice
        preference, supported actions and human-transfer behaviour. This does
        not provision a phone number or activate an agent.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {AGENT_TEMPLATES.map((template) => {
          const checked = selected === template.type;
          return (
            <label
              key={template.type}
              className={
                checked
                  ? "cursor-pointer rounded-md border border-accent bg-accent-subtle p-4"
                  : "cursor-pointer rounded-md border border-border bg-paper p-4 hover:border-accent"
              }
              data-agent-type={template.type}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="agent-type"
                  value={template.type}
                  checked={checked}
                  onChange={() => onSelect(template.type)}
                  aria-label={template.label}
                  className="mt-1"
                />
                <span>
                  <span className="sr-only">Agent role: </span>
                  <span className="block font-medium text-ink">
                    {template.label}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {template.summary}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
