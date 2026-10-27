"use client";

import { useRef, useState, useSyncExternalStore } from "react";

type ChatWidgetProps = {
  title?: string;
};

const subscribeHydration = () => () => {};
const clientHydratedSnapshot = () => true;
const serverHydratedSnapshot = () => false;

export function ChatWidget({ title = "Chat with us" }: ChatWidgetProps) {
  useSyncExternalStore(
    subscribeHydration,
    clientHydratedSnapshot,
    serverHydratedSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleTriggerClick() {
    setIsOpen((prev) => !prev);
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTriggerClick();
    }
  }

  return (
    <div
      className="mos-chat-widget fixed bottom-4 right-4 z-50"
      role="region"
      aria-label="Chat widget"
    >
      {!isOpen ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          className="mos-glass rounded-full border border-border bg-surface/90 p-3 shadow-lg hover:border-accent/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-label="Open chat"
          aria-expanded="false"
          aria-controls="chat-panel"
        >
          <svg
            className="w-6 h-6 text-ink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="sr-only">{title}</span>
        </button>
      ) : (
        <div
          id="chat-panel"
          className="mos-glass rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 min-w-[320px] max-w-[400px] shadow-lg"
          role="dialog"
          aria-label={title}
          aria-modal="false"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">{title}</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
              aria-label="Close chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">
            Online chat is not connected on this static site.{" "}
            <a
              href={`mailto:info@chapelgatetechnologies.com`}
              className="font-medium text-accent underline"
            >
              Email us directly
            </a>
            instead.
          </p>
        </div>
      )}
    </div>
  );
}
