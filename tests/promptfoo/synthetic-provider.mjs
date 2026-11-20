/**
 * Local synthetic provider for maintenanceos-website promptfoo eval.
 * No network, no model keys, no real data. Reads synthetic JSONL.
 */
import { readFileSync } from "node:fs";

export default class maintenanceos_websiteSyntheticProvider {
  constructor(options = {}) {
    this.providerId = options.id || "maintenanceos-website-synthetic";
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt) {
    const text = typeof prompt === "string" ? prompt : JSON.stringify(prompt);
    if (/PII-free|real PII/i.test(text)) {
      return { output: "SYNTHETIC PII-FREE" };
    }
    const m = text.match(/Intent: (\S+)/);
    if (m) {
      return { output: m[1] };
    }
    return { output: "OK synthetic maintenanceos-website response" };
  }
}
