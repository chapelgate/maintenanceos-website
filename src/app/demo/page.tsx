import { DemoConversionTabs } from "@/components/DemoConversionTabs";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Demo & launch list" };

export default function DemoPage() {
  return (
    <>
      <PageHero
        eyebrow="Conversion"
        title="Request an early demo or join the launch list"
        lede="Canonical conversion page. Choose the path that fits — we are pre-launch and will not claim a live commercial service."
      />
      <DemoConversionTabs />
    </>
  );
}
