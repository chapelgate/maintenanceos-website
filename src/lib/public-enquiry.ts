/**
 * The Railway control plane that used to receive leads and events now
 * returns HTTP 404 "Application not found" for every path. Do not post to it.
 */
export const RETIRED_LEAD_HOST = "rsfm-control-plane-production.up.railway.app";

/** Public contact address for human enquiries and early access. */
export const PUBLIC_ENQUIRY_EMAIL = "info@chapelgatetechnologies.com";

export const ENQUIRY_UNAVAILABLE_MESSAGE =
  "Online enquiries are temporarily unavailable. Please email info@chapelgatetechnologies.com.";

export function usableHttpEndpoint(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (url.hostname === RETIRED_LEAD_HOST) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export const MAX_ENQUIRY_SUBJECT_LENGTH = 120;
export const MAX_ENQUIRY_BODY_LENGTH = 1200;
export const MAX_ENQUIRY_MAILTO_LENGTH = 1900;

export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  landlord: "Landlord",
  letting_agent: "Letting agent",
  property_manager: "Property manager",
  maintenance_company: "Maintenance company",
  housing_association: "Housing association",
  facilities_management: "Facilities management",
  council: "Council",
  holiday_lets: "Holiday lets",
  other: "Other",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_ALLOWED_PATTERN = /^[0-9+\s().-]+$/;

export type EnquiryMailtoInput = {
  name?: string;
  email: string;
  phone?: string;
  businessType?: string;
  role?: string;
  organisation?: string;
  message?: string;
  leadType?: string;
  maxBodyLength?: number;
  maxUrlLength?: number;
};

export type EnquiryMailtoDraft = {
  to: string;
  subject: string;
  body: string;
  copyText: string;
  mailtoHref: string;
};

export type EnquiryValidationResult =
  | {
      ok: true;
      values: {
        name: string;
        email: string;
        phone: string;
        businessType: string;
        organisation: string;
        message: string;
      };
    }
  | {
      ok: false;
      field: "email" | "phone";
      error: string;
    };

function truncateUtf16Safe(value: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (value.length <= maxLength) return value;
  let sliced = value.slice(0, maxLength);
  const lastCode = sliced.charCodeAt(sliced.length - 1);
  if (lastCode >= 0xd800 && lastCode <= 0xdbff) {
    sliced = sliced.slice(0, -1);
  }
  return sliced;
}

function cleanSingleLine(value: string | undefined, maxLength: number): string {
  const collapsed = (value ?? "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return truncateUtf16Safe(collapsed, maxLength);
}

export function isValidEnquiryPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.length > 30 || !PHONE_ALLOWED_PATTERN.test(trimmed)) return false;
  const digitCount = (trimmed.match(/\d/g) ?? []).length;
  return digitCount >= 7 && digitCount <= 20;
}

export function validateEnquiryFields(
  input: EnquiryMailtoInput,
): EnquiryValidationResult {
  const email = cleanSingleLine(input.email, 254);
  if (!email) {
    return {
      ok: false,
      field: "email",
      error: "Enter an email address.",
    };
  }
  if (!EMAIL_PATTERN.test(email) || email.includes("..")) {
    return {
      ok: false,
      field: "email",
      error: "Enter a valid email address.",
    };
  }
  const phone = cleanSingleLine(input.phone, 40);
  if (phone && !isValidEnquiryPhone(phone)) {
    return {
      ok: false,
      field: "phone",
      error: "Enter a valid phone number.",
    };
  }
  return {
    ok: true,
    values: {
      name: cleanSingleLine(input.name, 80),
      email,
      phone,
      businessType: cleanSingleLine(input.businessType || input.role, 80),
      organisation: cleanSingleLine(input.organisation, 120),
      message: truncateUtf16Safe(
        (input.message ?? "").replace(/\r\n?/g, "\n").trim(),
        MAX_ENQUIRY_BODY_LENGTH,
      ),
    },
  };
}

export function buildEnquiryMailto(
  input: EnquiryMailtoInput,
): EnquiryMailtoDraft {
  const name = cleanSingleLine(input.name, 80);
  const email = cleanSingleLine(input.email, 254);
  const phone = cleanSingleLine(input.phone, 40);
  const rawBusinessType = cleanSingleLine(input.businessType || input.role, 80);
  const businessType = BUSINESS_TYPE_LABELS[rawBusinessType] ?? rawBusinessType;
  const organisation = cleanSingleLine(input.organisation, 120);
  const leadType = cleanSingleLine(input.leadType, 60);
  const rawMessage = (input.message ?? "").replace(/\r\n?/g, "\n").trim();

  const subject = truncateUtf16Safe(
    name ? `WorkSmartOS enquiry from ${name}` : "WorkSmartOS enquiry",
    MAX_ENQUIRY_SUBJECT_LENGTH,
  );

  const lines: string[] = [];
  if (leadType) {
    lines.push(`Enquiry type: ${leadType}`);
  }
  lines.push(`Name: ${name || "Not provided"}`);
  lines.push(`Email: ${email}`);
  lines.push(`Phone: ${phone || "Not provided"}`);
  if (organisation) {
    lines.push(`Organisation: ${organisation}`);
  }
  lines.push(`Business type: ${businessType || "Not provided"}`);
  lines.push("");
  lines.push("Message:");
  lines.push(rawMessage || "No additional message.");

  const maxBodyLength = input.maxBodyLength ?? MAX_ENQUIRY_BODY_LENGTH;
  const maxUrlLength = input.maxUrlLength ?? MAX_ENQUIRY_MAILTO_LENGTH;

  let body = truncateUtf16Safe(lines.join("\n"), maxBodyLength);
  const prefix = `mailto:${PUBLIC_ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=`;
  let mailtoHref = `${prefix}${encodeURIComponent(body)}`;

  while (mailtoHref.length > maxUrlLength && body.length > 0) {
    const nextLength = Math.max(0, Math.floor(body.length * 0.85) - 1);
    body = truncateUtf16Safe(body, nextLength);
    mailtoHref = `${prefix}${encodeURIComponent(body)}`;
  }

  const copyText = `To: ${PUBLIC_ENQUIRY_EMAIL}\nSubject: ${subject}\n\n${body}`;

  return {
    to: PUBLIC_ENQUIRY_EMAIL,
    subject,
    body,
    copyText,
    mailtoHref,
  };
}

