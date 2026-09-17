import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = { title: "Councils" };

export default function Page() {
  return (
    <IndustryStubPage
      title="Councils"
      audience="For local-authority housing and repairs teams exploring modern operations tooling."
      focus={[
    "Structured resident intake",
    "Human oversight on critical safety",
    "Honest pre-launch posture — no fabricated public-sector case studies"
  ]}
    />
  );
}
