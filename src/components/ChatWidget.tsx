"use client";

import { FormEvent, useId, useRef, useState, useSyncExternalStore } from "react";

type ChatWidgetProps = {
  title?: string;
  placeholder?: string;
  pageContext?: string;
};

const subscribeHydration = () => () => {};
const clientHydratedSnapshot = () => true;
const serverHydratedSnapshot = () => false;

export function ChatWidget({
  title = "Chat with us",
  placeholder = "Describe your issue…",
  pageContext,
}: ChatWidgetProps) {
  useSyncExternalStore(
    subscribeHydration,
    clientHydratedSnapshot,
    serverHydratedSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const errorId = useId();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError("Enter a message.");
      messageRef.current?.focus();
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedMessage,
          pageContext,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setStatus("success");
      setMessage("");
      formRef.current?.reset();
    } catch {
      setError("Could not send message. Please try again or email us directly.");
      setStatus("error");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  }

  function handleTriggerClick() {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setTimeout(() => messageRef.current?.focus(), 0);
    }
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTriggerClick();
    }
  }

  if (status === "success") {
    return (
      <div
        className="mos-chat-widget fixed bottom-4 right-4 z-50"
        role="region"
        aria-label="Chat widget"
      >
        <div className="mos-glass rounded-[var(--mos-radius-lg)] border border-border p-5 min-w-[320px] max-w-[400px] shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">{title}</h3>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setIsOpen(false);
              }}
              className="text-muted hover:text-ink transition-colors"
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
          <p className="mt-3 text-sm text-ink">
            Thanks for your message. We will reply to your email shortly.
          </p>
          <p className="mt-2 text-xs text-muted">
            Pre-launch: chat messages are forwarded to our team email.
          </p>
        </div>
      </div>
    );
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
            Messages reach our team directly. No mouse required — use Tab and
            Enter.
          </p>
          <form
            ref={formRef}
            onSubmit={onSubmit}
            className="mt-4 space-y-3"
            noValidate
          >
            <label className="block text-sm">
              <span className="font-medium text-ink">Message</span>
              <textarea
                ref={messageRef}
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={3}
                required
                aria-label="Message"
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className="mt-1 w-full rounded-md border border-border bg-paper px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                disabled={status === "submitting"}
              />
              {error ? (
                <span
                  id={errorId}
                  className="mt-1 block text-sm text-red-700"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </span>
              ) : null}
            </label>
            <button
              type="submit"
              disabled={status === "submitting" || !message.trim()}
              className="w-full inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {status === "submitting" ? "Sending…" : "Send message"}
            </button>
            <p className="text-xs text-muted text-center">
              Pre-launch: messages are forwarded to{" "}
              <a
                href={`mailto:info@chapelgatetechnologies.com`}
                className="font-medium text-accent underline"
              >
                info@chapelgatetechnologies.com
              </a>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}