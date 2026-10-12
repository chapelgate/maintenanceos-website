"use client";

import { useSyncExternalStore } from "react";
import {
  ENQUIRY_UNAVAILABLE_MESSAGE,
  PUBLIC_ENQUIRY_EMAIL,
} from "@/lib/public-enquiry";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/**
 * Shown instead of a lead form when no working receiver is configured.
 * Does not post, and does not claim a submission was stored.
 *
 * The address is omitted from the server HTML. Cloudflare's email
 * obfuscation rewrites any address in that HTML before hydration, and
 * React then throws minified error 418. The address is added after
 * hydration, which Cloudflare does not rewrite.
 */
export function EnquiryUnavailable({
  id,
  title,
  helper,
}: {
  id?: string;
  title?: string;
  helper?: string;
}) {
  const addressReady = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );

  return (
    <div
      id={id}
      className="rounded-md border border-border bg-surface p-6"
      role="status"
      data-enquiry-unavailable=""
      data-enquiry-address={addressReady ? "ready" : "pending"}
    >
      {title ? <h2 className="text-lg font-semibold text-ink">{title}</h2> : null}
      {helper ? <p className="mt-2 text-sm text-muted">{helper}</p> : null}
      <p className="mt-3 text-sm text-ink">
        {addressReady
          ? ENQUIRY_UNAVAILABLE_MESSAGE
          : "Online enquiries are temporarily unavailable. Please email us from the link below."}
      </p>
      <p className="mt-4">
        {addressReady ? (
          <a
            href={`mailto:${PUBLIC_ENQUIRY_EMAIL}`}
            className="inline-flex min-h-11 items-center font-medium text-accent underline-offset-4 hover:underline"
          >
            Email {PUBLIC_ENQUIRY_EMAIL}
          </a>
        ) : (
          <span className="inline-flex min-h-11 items-center font-medium text-accent">
            Email
          </span>
        )}
      </p>
    </div>
  );
}
