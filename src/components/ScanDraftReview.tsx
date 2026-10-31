import { useId } from "react";
import type { BusinessFacts, BusinessFactMeta } from "@/lib/types";

const LABEL_CLASS = "block text-sm font-medium text-ink mb-1";
const VALUE_CLASS = "font-inherit rounded-md border border-border bg-paper px-3 py-2";

/**
 * Review scan draft, showing "Unknown — not found" for fields omitted
 * due to low confidence rather than inventing values.
 */
export function ScanDraftReview({
  facts,
}: {
  facts: BusinessFacts;
  factMeta: BusinessFactMeta;
}) {
  const id = useId();

  return (
    <div className="space-y-4" data-scan-draft="review">
      {((facts.businessName ?? "").toString()) !== "Unknown — not found" && (
        <div key="businessName" className="space-y-2">
          <label className={LABEL_CLASS} htmlFor={`businessName-${id}`}>
            Business Name
          </label>
          <p className={VALUE_CLASS} id={`businessName-${id}`}>
            {facts.businessName}
          </p>
        </div>
      )}
      {((facts.address ?? "").toString()) !== "Unknown — not found" && (
        <div key="address" className="space-y-2">
          <label className={LABEL_CLASS} htmlFor={`address-${id}`}>
            Address
          </label>
          <p className={VALUE_CLASS} id={`address-${id}`}>
            {facts.address}
          </p>
        </div>
      )}
      {((facts.hours ?? "").toString()) !== "Unknown — not found" && (
        <div key="hours" className="space-y-2">
          <label className={LABEL_CLASS} htmlFor={`hours-${id}`}>
            Hours
          </label>
          <p className={VALUE_CLASS} id={`hours-${id}`}>
            {facts.hours}
          </p>
        </div>
      )}
      {((facts.services ?? []).toString()) !== "Unknown — not found" && (
        <div key="services" className="space-y-2">
          <label className={LABEL_CLASS} htmlFor={`services-${id}`}>
            Services
          </label>
          <p className={VALUE_CLASS} id={`services-${id}`}>
            {facts.services}
          </p>
        </div>
      )}
      {((facts.faqs ?? []).length > 0 && ((facts.faqs ?? []).map((f) => f.question).join("\n\n")) !== "Unknown — not found") && (
        <div key="faqs" className="space-y-2">
          <label className={LABEL_CLASS} htmlFor={`faqs-${id}`}>
            FAQs
          </label>
          <pre className={VALUE_CLASS} id={`faqs-${id}`}>
            {(facts.faqs ?? []).join("\n\n")}
          </pre>
        </div>
      )}
      {((facts.businessName ?? "").toString()) === "Unknown — not found" && (
        <div key="businessNameUnknown" className="text-sm text-muted">
          Business Name: Unknown — not found
        </div>
      )}
      {((facts.address ?? "").toString()) === "Unknown — not found" && (
        <div key="addressUnknown" className="text-sm text-muted">
          Address: Unknown — not found
        </div>
      )}
      {((facts.hours ?? "").toString()) === "Unknown — not found" && (
        <div key="hoursUnknown" className="text-sm text-muted">
          Hours: Unknown — not found
        </div>
      )}
      {((facts.services ?? []).toString()) === "Unknown — not found" && (
        <div key="servicesUnknown" className="text-sm text-muted">
          Services: Unknown — not found
        </div>
      )}
      {((facts.faqs ?? []).length > 0 && ((facts.faqs ?? []).map((f) => f.question).join("\n\n")) === "Unknown — not found") && (
        <div key="faqsUnknown" className="text-sm text-muted">
          FAQs: Unknown — not found
        </div>
      )}
    </div>
  );
}