import { sanitizeHtml } from "./sanitize";

/**
 * Convert a simple markdown subset to sanitised HTML.
 *
 * Block structure (headings, tables, blockquotes, lists) is resolved before
 * inline formatting and paragraph wrapping, so block elements (`<ul>`,
 * `<li>`, `<h*>`, `<blockquote>`, `<div>`) are never wrapped inside `<p>`.
 * Bullet markers (`•`) are omitted because the `list-disc` class renders them
 * natively — emitting both produces duplicate bullets and an invalid
 * `<p><ul><li>…</li></ul></p>` structure that accessibility tools flag.
 */
export function markdownToHtml(content: string): string {
  // Split into blocks separated by blank lines.
  const blocks = content.split(/\n\n+/);

  const html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      // Heading
      const h1 = trimmed.match(/^# (.+)$/);
      if (h1) return `<h2 class="text-2xl font-semibold text-ink mt-10 mb-4">${inlineFormat(h1[1])}</h2>`;

      const h2 = trimmed.match(/^## (.+)$/);
      if (h2) return `<h3 class="text-xl font-semibold text-ink mt-8 mb-3">${inlineFormat(h2[1])}</h3>`;

      const h3 = trimmed.match(/^### (.+)$/);
      if (h3) return `<h4 class="text-lg font-semibold text-ink mt-6 mb-2">${inlineFormat(h3[1])}</h4>`;

      // Table
      if (/^\|(.+)\|$/.test(trimmed.split("\n")[0])) {
        const lines = trimmed.split("\n").filter((line) => line.trim());
        if (lines[0].includes("---")) return "";
        const rows = lines.map((line) => {
          const cells = line
            .split("|")
            .slice(1, -1)
            .map((c) => `<td class="px-4 py-3 text-sm text-ink">${inlineFormat(c.trim())}</td>`)
            .join("");
          return `<tr class="bg-surface/300">${cells}</tr>`;
        });
        return `<div class="overflow-x-auto my-6" tabIndex={0}><table class="min-w-full divide-y divide-border"><tbody>${rows.join("")}</tbody></table></div>`;
      }

      // Blockquote
      if (/^> /.test(trimmed.split("\n")[0])) {
        const lines = trimmed.split("\n").map((line) => line.replace(/^> ?/, ""));
        return `<blockquote class="border-l-4 border-accent pl-4 my-4 text-muted italic">${inlineFormat(lines.join(" "))}</blockquote>`;
      }

      // List block — consecutive `- ` lines form one <ul>
      if (/^- /.test(trimmed.split("\n")[0])) {
        const items = trimmed
          .split("\n")
          .filter((line) => /^- /.test(line))
          .map((line) => `<li class="ml-4 mb-1">${inlineFormat(line.replace(/^- /, "").trim())}</li>`);
        return `<ul class="list-disc list-inside space-y-1 text-sm text-muted my-4">${items.join("")}</ul>`;
      }

      // Paragraph with inline formatting
      return `<p class="mt-4 text-sm text-muted">${inlineFormat(trimmed)}</p>`;
    })
    .join("");

  return sanitizeHtml(html);
}

/**
 * Apply inline markdown formatting inside a paragraph or other inline context.
 */
function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent underline">$1</a>');
}
