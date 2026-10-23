import assert from "node:assert/strict";
import test from "node:test";
import { isPublishablePriceLabel } from "./publishable-price.ts";

test("placeholder labels are not publishable", () => {
  assert.equal(
    isPublishablePriceLabel("[ANDY: Starter tier price — e.g. XX/month per property]"),
    false,
  );
  assert.equal(isPublishablePriceLabel(""), false);
});

test("a real label is publishable", () => {
  assert.equal(isPublishablePriceLabel("Ask for a quote"), true);
});
