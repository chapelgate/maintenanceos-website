"use client";

import dynamic from "next/dynamic";

const DeferredDemoConversionTabsComponent = dynamic(
  () =>
    import("@/components/DemoConversionTabs").then(
      (module) => module.DemoConversionTabs,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted" aria-busy="true">
        Loading demo tabs…
      </p>
    ),
  },
);

export function DeferredDemoConversionTabs() {
  return <DeferredDemoConversionTabsComponent />;
}
