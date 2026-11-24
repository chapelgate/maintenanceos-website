import assert from "node:assert/strict";
import test from "node:test";
import { markdownToHtml } from "./markdown-to-html.ts";

test("markdownToHtml: simple paragraph", () => {
  const out = markdownToHtml("Hello world");
  assert.ok(out.includes("<p class=\"mt-4 text-sm text-muted\">Hello world</p>"));
});

test("markdownToHtml: headings", () => {
  const out = markdownToHtml("# H1\n\n## H2\n\n### H3");
  assert.ok(out.includes("<h2 class=\"text-2xl font-semibold text-ink mt-10 mb-4\">H1</h2>"));
  assert.ok(out.includes("<h3 class=\"text-xl font-semibold text-ink mt-8 mb-3\">H2</h3>"));
  assert.ok(out.includes("<h4 class=\"text-lg font-semibold text-ink mt-6 mb-2\">H3</h4>"));
});

test("markdownToHtml: bullet list produces valid <ul><li> without <p> wrapping", () => {
  const out = markdownToHtml("- Item 1\n- Item 2\n- Item 3");
  // Should produce a single <ul> with <li> children
  assert.ok(out.includes("<ul class=\"list-disc list-inside space-y-1 text-sm text-muted my-4\">"));
  assert.ok(out.includes("<li class=\"ml-4 mb-1\">Item 1</li>"));
  assert.ok(out.includes("<li class=\"ml-4 mb-1\">Item 2</li>"));
  assert.ok(out.includes("<li class=\"ml-4 mb-1\">Item 3</li>"));
  // No <p> should wrap the <ul> or <li>
  assert.ok(!out.includes("<p><ul"));
  assert.ok(!out.includes("<li>Item 1</li></p>"));
  // No literal bullet character (CSS list-disc handles it)
  assert.ok(!out.includes("•"));
});

test("markdownToHtml: list separated from paragraphs", () => {
  const out = markdownToHtml("Para 1\n\n- Item 1\n- Item 2\n\nPara 2");
  // Three blocks: paragraph, list, paragraph
  const pCount = (out.match(/<p class="mt-4 text-sm text-muted">/g) || []).length;
  assert.equal(pCount, 2);
  // Single ul
  const ulCount = (out.match(/<ul class="list-disc list-inside space-y-1 text-sm text-muted my-4">/g) || []).length;
  assert.equal(ulCount, 1);
});

test("markdownToHtml: blockquote", () => {
  const out = markdownToHtml("> This is a quote");
  assert.ok(out.includes("<blockquote class=\"border-l-4 border-accent pl-4 my-4 text-muted italic\">This is a quote</blockquote>"));
});

test("markdownToHtml: table", () => {
  const out = markdownToHtml("| A | B |\n|---|---|\n| 1 | 2 |");
  assert.ok(out.includes("<div class=\"overflow-x-auto my-6\""));
  assert.ok(out.includes("<table class=\"min-w-full divide-y divide-border\""));
  assert.ok(out.includes("<td class=\"px-4 py-3 text-sm text-ink\">1</td>"));
});

test("markdownToHtml: inline formatting", () => {
  const out = markdownToHtml("**bold** and *italic* and [link](https://example.com)");
  assert.ok(out.includes("<strong>bold</strong>"));
  assert.ok(out.includes("<em>italic</em>"));
  assert.ok(out.includes('<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-accent underline">link</a>'));
});

test("markdownToHtml: list with inline formatting in items", () => {
  const out = markdownToHtml("- **Bold item**\n- *Italic item*");
  assert.ok(out.includes("<li class=\"ml-4 mb-1\"><strong>Bold item</strong></li>"));
  assert.ok(out.includes("<li class=\"ml-4 mb-1\"><em>Italic item</em></li>"));
});