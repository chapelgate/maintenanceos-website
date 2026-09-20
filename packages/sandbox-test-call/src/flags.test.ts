import assert from "node:assert/strict";
import test from "node:test";
import { isSandboxTestCallEnabled } from "./flags.ts";

test("SANDBOX_TEST_CALL_ENABLED is off by default", () => {
  assert.equal(isSandboxTestCallEnabled({}), false);
  assert.equal(isSandboxTestCallEnabled({ SANDBOX_TEST_CALL_ENABLED: "false" }), false);
  assert.equal(isSandboxTestCallEnabled({ SANDBOX_TEST_CALL_ENABLED: "" }), false);
  assert.equal(isSandboxTestCallEnabled({ SANDBOX_TEST_CALL_ENABLED: "true" }), true);
  assert.equal(isSandboxTestCallEnabled({ SANDBOX_TEST_CALL_ENABLED: "1" }), true);
});

test("ONBOARDING_SANDBOX_CALL is accepted as an alias", () => {
  assert.equal(isSandboxTestCallEnabled({ ONBOARDING_SANDBOX_CALL: "true" }), true);
  assert.equal(isSandboxTestCallEnabled({ ONBOARDING_SANDBOX_CALL: "false" }), false);
});
