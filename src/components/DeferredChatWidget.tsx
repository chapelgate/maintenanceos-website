"use client";

import dynamic from "next/dynamic";
import type { ChatWidgetProps } from "@/components/ChatWidget";

const DeferredChatWidgetComponent = dynamic(
  () =>
    import("@/components/ChatWidget").then((module) => module.ChatWidget),
  {
    ssr: false,
    loading: () => (
      <div
        className="mos-chat-widget fixed bottom-4 right-4 z-50"
        role="region"
        aria-label="Chat widget"
        aria-busy="true"
      >
        <span className="sr-only">Loading chat widget…</span>
        <button
          type="button"
          className="mos-chat-trigger bg-accent text-ink rounded-full p-3 shadow-lg animate-pulse"
          disabled
          aria-label="Chat with us (loading)"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    ),
  },
);

export function DeferredChatWidget({ title = "Chat with us" }: ChatWidgetProps) {
  return <DeferredChatWidgetComponent title={title} />;
}
