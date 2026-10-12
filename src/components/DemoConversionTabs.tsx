"use client";

import { useCallback, useEffect, useId, useSyncExternalStore } from "react";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";

type TabId = "launch" | "demo";

const tabStoreEvent = "maintenanceos:demo-conversion-tab";

function tabFromHash(): TabId {
  const hash = window.location.hash.replace(/^#/, "");
  return hash === "demo" ? "demo" : "launch";
}

function subscribeToTab(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener(tabStoreEvent, onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener(tabStoreEvent, onStoreChange);
  };
}

export function DemoConversionTabs() {
  const baseId = useId();
  const tab = useSyncExternalStore(
    subscribeToTab,
    tabFromHash,
    () => "launch",
  );

  const launchTabId = `${baseId}-tab-launch`;
  const demoTabId = `${baseId}-tab-demo`;
  const launchPanelId = `${baseId}-panel-launch`;
  const demoPanelId = `${baseId}-panel-demo`;

  const select = useCallback((next: TabId) => {
    const hash = next === "demo" ? "#demo" : "#launch";
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
      window.dispatchEvent(new Event(tabStoreEvent));
    }
  }, []);

  useEffect(() => {
    function placeTabs() {
      const hash = window.location.hash;
      if (hash !== "#demo" && hash !== "#launch") return;
      document
        .getElementById("demo-conversion-tabs")
        ?.scrollIntoView({ block: "start" });
    }
    placeTabs();
    window.addEventListener("hashchange", placeTabs);
    return () => window.removeEventListener("hashchange", placeTabs);
  }, []);

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    const next: TabId =
      event.key === "End" || event.key === "ArrowRight" ? "demo" : "launch";
    select(next);
    const id = next === "demo" ? demoTabId : launchTabId;
    requestAnimationFrame(() => document.getElementById(id)?.focus());
  };

  return (
    <div
      id="demo-conversion-tabs"
      className="demo-conversion-tabs mx-auto max-w-xl px-4 py-12"
    >
      <div
        role="tablist"
        aria-label="Conversion options"
        className="flex gap-1 rounded-lg border border-border bg-surface p-1"
      >
        <button
          type="button"
          role="tab"
          id={launchTabId}
          aria-controls={launchPanelId}
          aria-selected={tab === "launch"}
          tabIndex={tab === "launch" ? 0 : -1}
          className={
            tab === "launch"
              ? "flex-1 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent"
              : "flex-1 rounded-md px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
          }
          onClick={() => select("launch")}
          onKeyDown={onTabKeyDown}
        >
          Join launch list
        </button>
        <button
          type="button"
          role="tab"
          id={demoTabId}
          aria-controls={demoPanelId}
          aria-selected={tab === "demo"}
          tabIndex={tab === "demo" ? 0 : -1}
          className={
            tab === "demo"
              ? "flex-1 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent"
              : "flex-1 rounded-md px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
          }
          onClick={() => select("demo")}
          onKeyDown={onTabKeyDown}
        >
          Request early access
        </button>
      </div>

      <div
        role="tabpanel"
        id={launchPanelId}
        aria-labelledby={launchTabId}
        hidden={tab !== "launch"}
        className="mt-6"
      >
        {tab === "launch" ? (
          <div id="launch">
            <LeadCaptureForm
              leadType="launch_list"
              title="Join the launch list"
              helper="Updates only. No instant live receptionist and no live number."
              submitLabel="Join launch list"
            />
          </div>
        ) : null}
      </div>

      <div
        role="tabpanel"
        id={demoPanelId}
        aria-labelledby={demoTabId}
        hidden={tab !== "demo"}
        className="mt-6"
      >
        {tab === "demo" ? (
          <div id="demo">
            <LeadCaptureForm
              leadType="early_demo"
              title="Request an early access briefing"
              helper="A human briefing about fit and what is verified today — not live number provisioning. No spam, no fake “instant live receptionist” claims."
              submitLabel="Request early access"
              showMessage
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
