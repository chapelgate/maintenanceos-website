import assert from "node:assert/strict";
import test from "node:test";
import {
   buildEnquiryMailto,
  ENQUIRY_UNAVAILABLE_MESSAGE,
  MAX_ENQUIRY_BODY_LENGTH,
  MAX_ENQUIRY_MAILTO_LENGTH,
  PUBLIC_ENQUIRY_EMAIL,
  RETIRED_LEAD_HOST,
  usableHttpEndpoint,
  validateEnquiryFields,
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
  assert.equal(PUBLIC_ENQUIRY_EMAIL, "info@chapelgatetechnologies.com");
  assert.match(ENQUIRY_UNAVAILABLE_MESSAGE, /temporarily unavailable/);
  assert.match(ENQUIRY_UNAVAILABLE_MESSAGE, new RegExp(PUBLIC_ENQUIRY_EMAIL));
  assert.doesNotMatch(ENQUIRY_UNAVAILABLE_MESSAGE, /thank you|submitted|received/i);
});

test("buildEnquiryMailto builds URL-encoded mailto link with WorkSmartOS subject and fields", () => {
  const draft = buildEnquiryMailto({
    name: "Jane Doe",
    email: "jane@example.co.uk",
    phone: "+44 7700 900123",
    businessType: "property_manager",
    organisation: "Oak Estates",
    message: "Looking for an early demo of intake rules.",
    leadType: "early_demo",
  });

  assert.equal(draft.to, "info@chapelgatetechnologies.com");
  assert.equal(draft.subject, "WorkSmartOS enquiry from Jane Doe");
  assert.match(draft.mailtoHref, /^mailto:info@chapelgatetechnologies\.com\?subject=/);
  assert.doesNotMatch(draft.mailtoHref, /\s/);
  assert.match(draft.body, /Name: Jane Doe/);
  assert.match(draft.body, /Email: jane@example\.co\.uk/);
  assert.match(draft.body, /Phone: \+44 7700 900123/);
  assert.match(draft.body, /Business type: Property manager/);
  assert.match(draft.body, /Organisation: Oak Estates/);
  assert.match(draft.body, /Looking for an early demo of intake rules\./);
  assert.match(draft.copyText, /To: info@chapelgatetechnologies\.com/);
  assert.match(draft.copyText, /Subject: WorkSmartOS enquiry from Jane Doe/);
});

test("buildEnquiryMailto encodes special characters and falls back when name is blank", () => {
  const draft = buildEnquiryMailto({
    name: "   ",
    email: "ops+test@example.co.uk",
    phone: "020 7946 0999",
    businessType: "letting_agent",
    message: " repairs & quotes = 100% #1? Yes/No + £50\nLine 2 \"quoted\" 'single'",
  });

  assert.equal(draft.subject, "WorkSmartOS enquiry");
  const query = draft.mailtoHref.split("?")[1] ?? "";
  const subjectMatch = query.match(/^subject=([^&]*)&body=(.*)$/);
  assert.ok(subjectMatch, "mailto query should contain encoded subject and body");
  assert.equal(decodeURIComponent(subjectMatch[1]), "WorkSmartOS enquiry");
  const decodedBody = decodeURIComponent(subjectMatch[2]);
  assert.match(decodedBody, /ops\+test@example\.co\.uk/);
  assert.match(decodedBody, /repairs & quotes = 100% #1\? Yes\/No \+ £50/);
  assert.match(decodedBody, /Line 2 "quoted" 'single'/);
  assert.doesNotMatch(subjectMatch[2], /[&#?= ]/);
});

test("buildEnquiryMailto caps body and mailto URL length safely", () => {
  const longMessage = "Urgent boiler & pipe check £99 ".repeat(200);
  const draft = buildEnquiryMailto({
    name: "Alex Smith",
    email: "alex@example.co.uk",
    phone: "07700900000",
    businessType: "landlord",
    message: longMessage,
  });

  assert.ok(
    draft.body.length <= MAX_ENQUIRY_BODY_LENGTH,
    `body length ${draft.body.length} exceeds ${MAX_ENQUIRY_BODY_LENGTH}`,
  );
  assert.ok(
    draft.mailtoHref.length <= MAX_ENQUIRY_MAILTO_LENGTH,
    `mailtoHref length ${draft.mailtoHref.length} exceeds ${MAX_ENQUIRY_MAILTO_LENGTH}`,
  );
  const bodyParam = draft.mailtoHref.split("&body=")[1] ?? "";
  assert.doesNotThrow(() => decodeURIComponent(bodyParam));
});

test("validateEnquiryFields checks required email and optional phone format", () => {
  assert.deepEqual(validateEnquiryFields({ email: "   " }), {
    ok: false,
    field: "email",
    error: "Enter an email address.",
  });
  assert.deepEqual(validateEnquiryFields({ email: "not-an-email" }), {
    ok: false,
    field: "email",
    error: "Enter a valid email address.",
  });
  assert.deepEqual(
    validateEnquiryFields({ email: "valid@example.co.uk", phone: "abc" }),
    {
      ok: false,
      field: "phone",
      error: "Enter a valid phone number.",
    },
  );
  const valid = validateEnquiryFields({
    name: "Sam",
    email: "sam@example.co.uk",
    phone: "+44 7700 900456",
    businessType: "council",
    message: "Hello",
  });
  assert.equal(valid.ok, true);
});

