import type { JsonLdRecord } from "@/lib/json-ld";
import { sanitizeJsonLd } from "@/lib/sanitize";

type JsonLdProps = {
  data: JsonLdRecord;
};

/** Static JSON-LD script. Safe for `output: "export"` (no runtime fetch). */
export function JsonLd({ data }: JsonLdProps) {
  const json = sanitizeJsonLd(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
