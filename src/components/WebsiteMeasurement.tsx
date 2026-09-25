"use client";

import { useEffect } from "react";
import { trackWebsiteEvent } from "@/lib/measurement";

const CONVERSION_PATHS = new Set([
  "/create/",
  "/demo/",
  "/contact/",
  "/pricing/",
]);

export function WebsiteMeasurement() {
  useEffect(() => {
    trackWebsiteEvent({ event: "page_view" });

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!CONVERSION_PATHS.has(url.pathname)) return;

      trackWebsiteEvent({
        event: "cta_click",
        targetPath: url.pathname,
      });
    }

    let clientErrorSent = false;
    function sendClientErrorOnce() {
      if (clientErrorSent) return;
      clientErrorSent = true;
      trackWebsiteEvent({ event: "client_error" });
    }

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("error", sendClientErrorOnce);
    window.addEventListener("unhandledrejection", sendClientErrorOnce);

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("error", sendClientErrorOnce);
      window.removeEventListener("unhandledrejection", sendClientErrorOnce);
    };
  }, []);

  return null;
}
