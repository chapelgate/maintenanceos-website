"use client";

import dynamic from "next/dynamic";

const DeferredCookieConsentBanner = dynamic(
  () => import("@/components/CookieConsentBanner").then((m) => m.CookieConsentBanner),
  { ssr: false, loading: () => null },
);

export function DeferredCookieConsentBannerWrapper() {
  return <DeferredCookieConsentBanner />;
}