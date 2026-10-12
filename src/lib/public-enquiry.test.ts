import assert from "node:assert/strict";
import test from "node:test";
import {
  ENQUIRY_UNAVAILABLE_MESSAGE,
  PUBLIC_ENQUIRY_EMAIL,
  RETIRED_LEAD_HOST,
  usableHttpEndpoint,
} from "./public-enquiry.ts";

test("retired Railway endpoints are not usable and a real override still is", () => {
  assert.equal(
    usableHttpEndpoint(
      `https://${RETIRED_LEAD_HOST}/v1/public/website-leads`,
    ),
    "",
  );
  assert.equal(
    usableHttpEndpoint(
      `https://${RETIRED_LEAD_HOST}/v1/public/website-events`,
    ),
    "",
  );
  assert.equal(usableHttpEndpoint(""), "");
  assert.equal(usableHttpEndpoint("not a url"), "");
  assert.equal(
    usableHttpEndpoint("http://127.0.0.1:8787/leads"),
    "http://127.0.0.1:8787/leads",
  );
  assert.equal(PUBLIC_ENQUIRY_EMAIL, "andy@chapelgatehome.uk");
  assert.match(ENQUIRY_UNAVAILABLE_MESSAGE, /temporarily unavailable/);
  assert.match(ENQUIRY_UNAVAILABLE_MESSAGE, new RegExp(PUBLIC_ENQUIRY_EMAIL));
  assert.doesNotMatch(ENQUIRY_UNAVAILABLE_MESSAGE, /thank you|submitted|received/i);
});
