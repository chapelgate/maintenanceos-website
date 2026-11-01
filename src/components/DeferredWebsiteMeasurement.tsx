"use client";

import dynamic from "next/dynamic";

const DeferredWebsiteMeasurementComponent = dynamic(
  () =>
    import("@/components/WebsiteMeasurement").then(
      (module) => module.WebsiteMeasurement,
    ),
  { ssr: false },
);

export function DeferredWebsiteMeasurement() {
  return <DeferredWebsiteMeasurementComponent />;
}
