import { submitLead, type LeadPayload } from "./lead-adapter.ts";

const VALID_LEAD_TYPES: LeadPayload["leadType"][] = [
  "launch_list",
  "early_demo",
  "contact",
  "create_receptionist",
];

function validateLeadType(leadType: string): leadType is LeadPayload["leadType"] {
  return VALID_LEAD_TYPES.includes(leadType as LeadPayload["leadType"]);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_ALLOWED_RE = /^[0-9+\s().-]+$/;

export interface EnquiryRequest {
  leadType: string;
  email?: string;
  name?: string;
  organisation?: string;
  role?: string;
  message?: string;
  phone?: string;
  website?: string;
  submissionId?: string;
}

export interface EnquiryResponse {
  ok: boolean;
  error?: string;
  mode?: string;
  reference?: string;
  confirmationEmail?: "accepted" | "failed";
}

export async function processEnquiry(
  input: EnquiryRequest,
): Promise<{ status: number; body: EnquiryResponse }> {
  if (!input.leadType || !validateLeadType(input.leadType)) {
    return { status: 400, body: { ok: false, error: "Invalid or missing leadType" } };
  }

  if (!input.email || typeof input.email !== "string") {
    return { status: 400, body: { ok: false, error: "Email is required" } };
  }

  const email = input.email.trim();
  if (!EMAIL_RE.test(email)) {
    return {
      status: 400,
      body: { ok: false, error: "Please enter a valid email address." },
    };
  }

  if (input.phone !== undefined && input.phone !== null) {
    const phone = String(input.phone).trim();
    if (phone) {
      if (!PHONE_ALLOWED_RE.test(phone)) {
        return {
          status: 400,
          body: { ok: false, error: "Enter a valid phone number." },
        };
      }
      const digitCount = (phone.match(/\d/g) ?? []).length;
      if (digitCount < 7 || digitCount > 20) {
        return {
          status: 400,
          body: { ok: false, error: "Enter a valid phone number." },
        };
      }
    }
  }

  const result = await submitLead({
    leadType: input.leadType,
    email,
    name: input.name?.trim(),
    organisation: input.organisation?.trim(),
    role: input.role?.trim(),
    message: input.message?.trim(),
    website: input.website?.trim(),
    submissionId: input.submissionId?.trim(),
  });

  if (!result.ok) {
    return { status: 400, body: { ok: false, error: result.error } };
  }

  return {
    status: 201,
    body: {
      ok: true,
      mode: result.mode,
      reference: result.reference,
      confirmationEmail: result.confirmationEmail,
    },
  };
}