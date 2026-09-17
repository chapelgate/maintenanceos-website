import { LeadCaptureForm } from "@/components/LeadCaptureForm";
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
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div id="launch">
          <LeadCaptureForm
            leadType="launch_list"
            title="Join launch list"
            submitLabel="Join launch list"
          />
        </div>
        <div id="demo">
          <LeadCaptureForm
            leadType="early_demo"
            title="Request early demo"
            submitLabel="Request early demo"
            showMessage
          />
        </div>
      </div>
    </>
  );
}
