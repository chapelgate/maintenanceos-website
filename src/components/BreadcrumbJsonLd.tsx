export function BreadcrumbJsonLd(items: { itemListElement: Array<{ "@type": "ListItem"; position: number; name: string; item: string }> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(items.itemListElement).replace(/</g, "\\u003c") }}
    />
  );
}