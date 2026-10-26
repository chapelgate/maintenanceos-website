import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatWidget } from "./ChatWidget.tsx";

const render = (props: Parameters<typeof ChatWidget>[0] = {}) =>
  renderToStaticMarkup(React.createElement(ChatWidget, props));

test("ChatWidget renders with default props", () => {
  const html = render();

  assert.ok(html.includes("mos-chat-widget"));
  assert.ok(html.includes("Chat is not connected"));
  assert.ok(html.includes('type="button"'));
  assert.ok(html.includes('aria-label="Open chat availability"'));
});

test("ChatWidget renders with custom title", () => {
  const html = render({ title: "Questions about the preview?" });

  assert.ok(html.includes("Questions about the preview?"));
});

test("ChatWidget trigger has focus-visible styles", () => {
  const html = render();

  assert.ok(html.includes("focus-visible:ring-2"));
  assert.ok(html.includes("focus-visible:ring-accent"));
  assert.ok(html.includes("focus-visible:ring-offset-2"));
});

test("ChatWidget includes keyboard navigation support", () => {
  const html = render();

  assert.ok(html.includes("onKeyDown"));
});

test("ChatWidget renders in closed state by default", () => {
  const html = render();

  assert.ok(html.includes('aria-expanded="false"'));
});

test("ChatWidget has no fake submit form", () => {
  const html = render();

  assert.ok(!html.includes("<form"));
  assert.ok(!html.includes('type="submit"'));
  assert.ok(!html.includes("placeholder="));
});
