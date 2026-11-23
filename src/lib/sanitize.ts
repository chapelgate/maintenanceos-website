import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { serializeForInlineScript } from "./inline-script.ts";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

/**
 * Sanitize HTML content for safe use with dangerouslySetInnerHTML.
 * Allows only a strict set of tags and attributes needed for content pages.
 */
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      "h2",
      "h3",
      "h4",
      "p",
      "strong",
      "em",
      "a",
      "blockquote",
      "ul",
      "ol",
      "li",
      "table",
      "tbody",
      "tr",
      "td",
      "div",
      "span",
      "br",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "class",
      "tabIndex",
      "dateTime",
      "id",
      "aria-labelledby",
      "aria-describedby",
      "aria-controls",
      "aria-expanded",
      "aria-label",
      "role",
      "aria-live",
    ],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}

/**
 * Sanitize JSON-LD data - escape < characters for safe embedding in script tags.
 */
export function sanitizeJsonLd(jsonLd: Record<string, unknown>): string {
  return serializeForInlineScript(jsonLd);
}