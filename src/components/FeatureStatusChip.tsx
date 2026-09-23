import {
  marketingFeatureStatusLabel,
  type MarketingCardStatus,
} from "@/config/phone-ai-features";

/**
 * Honesty taxonomy chip for marketing cards and HIW steps.
 * VERIFIED = solid subtle blue. UNDER TEST = outline / warm-neutral.
 * Colour is not the only signal — label text is always present.
 */
export function FeatureStatusChip({ status }: { status: MarketingCardStatus }) {
  const label = marketingFeatureStatusLabel[status];
  const mark = status === "VERIFIED" ? "✓" : "○";
  const tone =
    status === "VERIFIED"
      ? "feature-status-chip feature-status-chip--verified"
      : "feature-status-chip feature-status-chip--under-test";

  return (
    <span className={tone}>
      <span aria-hidden="true">{mark}</span>
      {label}
    </span>
  );
}
