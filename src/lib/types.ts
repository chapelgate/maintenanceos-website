/**
 * Shared types for scanner accuracy and draft review.
 * Matches the types defined in packages/onboarding-ingest/src/types.ts
 */

export type BusinessFacts = {
  website?: string;
  businessName?: string;
  address?: string;
  locations?: string[];
  branches?: {
    name?: string;
    phone?: string;
    address?: string;
    hours?: string;
  }[];
  contact?: {
    phones?: string[];
    emails?: string[];
  };
  services?: string[];
  hours?: string;
  pricing?: string[];
  faqs?: Array<{ question: string; answer: string }>;
};

export type BusinessFactMeta = Partial<
  Record<
    "businessName" | "address" | "hours" | "services",
    { confidence: "high" | "medium" | "low"; source: string; sourceUrl?: string }
  >
>;

export type PartialDraft = {
  businessName?: string;
  greeting?: string;
  hours?: string;
  services?: string;
  faqs?: string;
};