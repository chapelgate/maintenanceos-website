import assert from "node:assert/strict";
import test from "node:test";
import {
  dashboardCatalogKindFromEnv,
  isCustomerDashboardDemoDataEnabled,
  isCustomerDashboardEnabled,
} from "./flags.ts";

test("CUSTOMER_DASHBOARD_ENABLED is off by default", () => {
  assert.equal(isCustomerDashboardEnabled({}), false);
  assert.equal(isCustomerDashboardEnabled({ CUSTOMER_DASHBOARD_ENABLED: "false" }), false);
  assert.equal(isCustomerDashboardEnabled({ CUSTOMER_DASHBOARD_ENABLED: "" }), false);
  assert.equal(isCustomerDashboardEnabled({ CUSTOMER_DASHBOARD_ENABLED: "true" }), true);
  assert.equal(isCustomerDashboardEnabled({ CUSTOMER_DASHBOARD_ENABLED: "1" }), true);
});

test("demo SAMPLE catalogue is on when the companion is enabled unless explicitly false", () => {
  assert.equal(isCustomerDashboardDemoDataEnabled({}), true);
  assert.equal(isCustomerDashboardDemoDataEnabled({ CUSTOMER_DASHBOARD_DEMO_DATA: "" }), true);
  assert.equal(isCustomerDashboardDemoDataEnabled({ CUSTOMER_DASHBOARD_DEMO_DATA: "true" }), true);
  assert.equal(isCustomerDashboardDemoDataEnabled({ CUSTOMER_DASHBOARD_DEMO_DATA: "false" }), false);
  assert.equal(dashboardCatalogKindFromEnv({}), "demo");
  assert.equal(
    dashboardCatalogKindFromEnv({ CUSTOMER_DASHBOARD_DEMO_DATA: "false" }),
    "empty",
  );
});
