import type { JsonLdRecord } from "@/lib/json-ld";

type JsonLdProps = {
  data: JsonLdRecord;
};

/** Static JSON-LD script. Safe for `output: "export"` (no runtime fetch). */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
