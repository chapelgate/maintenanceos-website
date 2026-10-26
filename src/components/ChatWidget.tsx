"use client";

import { useRef, useState, useSyncExternalStore } from "react";

type ChatWidgetProps = {
  title?: string;
  pageContext?: string;
};

const subscribeHydration = () => () => {};
const clientHydratedSnapshot = () => true;
const serverHydratedSnapshot = () => false;

const DEFAULT_TITLE = "Chat is not connected";
const ENQUIRY_MAIL = "info@chapelgatetechnologies.com";

export function ChatWidget({
  title = DEFAULT_TITLE,
  pageContext,
}: ChatWidgetProps) {
  useSyncExternalStore(
    subscribeHydration,
    clientHydratedSnapshot,
    serverHydratedSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function handleTriggerClick() {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => panelRef.current?.focus(), 0);
      }
      return next;
    });
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
      aria-label="Chat availability"
      data-page-context={pageContext || undefined}
    >
      {!isOpen ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          className="mos-glass rounded-full border border-border bg-surface/90 p-3 shadow-lg hover:border-accent/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-label="Open chat availability"
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
          ref={panelRef}
          tabIndex={-1}
          className="mos-glass rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 min-w-[320px] max-w-[400px] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
              aria-label="Close chat availability"
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
            Online chat is not connected on this static site. No message is
            delivered from this panel.{" "}
            <a
              href={`mailto:${ENQUIRY_MAIL}`}
              className="font-medium text-accent underline"
            >
              Email us directly
            </a>{" "}
            instead.
          </p>
        </div>
      )}
    </div>
  );
}
