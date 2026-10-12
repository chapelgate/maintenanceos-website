import {
  ENQUIRY_UNAVAILABLE_MESSAGE,
  PUBLIC_ENQUIRY_EMAIL,
} from "@/lib/public-enquiry";

/**
 * Shown instead of a lead form when no working receiver is configured.
 * Does not post, and does not claim a submission was stored.
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
  return (
    <div
      id={id}
      className="rounded-md border border-border bg-surface p-6"
      role="status"
      data-enquiry-unavailable=""
    >
      {title ? <h2 className="text-lg font-semibold text-ink">{title}</h2> : null}
      {helper ? <p className="mt-2 text-sm text-muted">{helper}</p> : null}
      <p className="mt-3 text-sm text-ink">{ENQUIRY_UNAVAILABLE_MESSAGE}</p>
      <p className="mt-4">
        <a
          href={`mailto:${PUBLIC_ENQUIRY_EMAIL}`}
          className="inline-flex min-h-11 items-center font-medium text-accent underline-offset-4 hover:underline"
        >
          Email {PUBLIC_ENQUIRY_EMAIL}
        </a>
      </p>
    </div>
  );
}
