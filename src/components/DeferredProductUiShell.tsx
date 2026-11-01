"use client";

import dynamic from "next/dynamic";

const DeferredProductUiShellComponent = dynamic(
  () =>
    import("@/components/ProductUiShell").then(
      (module) => module.ProductUiShell,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted" aria-busy="true">
        Loading supervisor shell preview…
      </p>
    ),
  },
);

export function DeferredProductUiShell() {
  return <DeferredProductUiShellComponent />;
}
