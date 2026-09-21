import {
  CREATE_INGEST_PRIVACY_ANCHOR,
  CREATE_INGEST_PRIVACY_DRAFT_LABEL,
  CREATE_INGEST_PRIVACY_HEADING,
  CREATE_INGEST_PRIVACY_NOTE,
} from "@/lib/create-ingest-privacy";

/**
 * Short /create footer note for website-URL ingest.
 * Server-only — do not import from the client form island.
 */
export function CreateIngestPrivacyNote() {
  return (
    <section
      className="mt-6 text-xs text-muted"
      aria-labelledby="create-privacy-heading"
    >
      <h3
        id="create-privacy-heading"
        className="text-sm font-semibold text-ink"
      >
        {CREATE_INGEST_PRIVACY_HEADING}
      </h3>
      <p className="mt-2">
        <strong className="font-medium text-ink">
          {CREATE_INGEST_PRIVACY_DRAFT_LABEL}.
        </strong>{" "}
        {CREATE_INGEST_PRIVACY_NOTE}{" "}
        <a
          href={`/privacy/#${CREATE_INGEST_PRIVACY_ANCHOR}`}
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Privacy Policy (Draft)
        </a>
        .
      </p>
    </section>
  );
}
