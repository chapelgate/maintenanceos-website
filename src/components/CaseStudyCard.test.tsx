import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CaseStudyCard } from "./CaseStudyCard.tsx";

const render = (props: Parameters<typeof CaseStudyCard>[0]) =>
  renderToStaticMarkup(React.createElement(CaseStudyCard, props));

test("CaseStudyCard renders with all props", () => {
  const html = render({
    logo: { src: "/logo.svg", alt: "Acme Corp logo" },
    quote: "This product transformed our workflow.",
    attribution: {
      name: "Jane Doe",
      role: "Operations Director",
      company: "Acme Corp",
    },
    cta: { href: "/case-studies/acme", label: "Read full story" },
  });

  assert.ok(html.includes("mos-bento-card"));
  assert.ok(html.includes('/logo.svg'));
  assert.ok(html.includes('alt="Acme Corp logo"'));
  assert.ok(html.includes("This product transformed our workflow."));
  assert.ok(html.includes("Jane Doe"));
  assert.ok(html.includes("Operations Director"));
  assert.ok(html.includes("Acme Corp"));
  assert.ok(html.includes('/case-studies/acme'));
  assert.ok(html.includes("Read full story"));
});

test("CaseStudyCard renders without optional CTA", () => {
  const html = render({
    logo: { src: "/logo.svg", alt: "Acme Corp logo" },
    quote: "This product transformed our workflow.",
    attribution: {
      name: "Jane Doe",
      role: "Operations Director",
      company: "Acme Corp",
    },
  });

  assert.ok(html.includes("mos-bento-card"));
  assert.ok(html.includes("Jane Doe"));
  assert.ok(!html.includes("Read full story"));
  assert.ok(!html.includes("href="));
});

test("CaseStudyCard applies custom className", () => {
  const html = render({
    logo: { src: "/logo.svg", alt: "Acme Corp logo" },
    quote: "Test quote.",
    attribution: {
      name: "Jane Doe",
      role: "Operations Director",
      company: "Acme Corp",
    },
    className: "custom-class",
  });

  assert.ok(html.includes("custom-class"));
});

test("CaseStudyCard logo has loading=lazy", () => {
  const html = render({
    logo: { src: "/logo.svg", alt: "Acme Corp logo" },
    quote: "Test quote.",
    attribution: {
      name: "Jane Doe",
      role: "Operations Director",
      company: "Acme Corp",
    },
  });

  assert.ok(html.includes('loading="lazy"'));
});

test("CaseStudyCard attribution uses cite element", () => {
  const html = render({
    logo: { src: "/logo.svg", alt: "Acme Corp logo" },
    quote: "Test quote.",
    attribution: {
      name: "Jane Doe",
      role: "Operations Director",
      company: "Acme Corp",
    },
  });

  assert.ok(html.includes("<cite"));
  assert.ok(html.includes("Jane Doe"));
});

test("CaseStudyCard CTA link has focus-visible styles", () => {
  const html = render({
    logo: { src: "/logo.svg", alt: "Acme Corp logo" },
    quote: "Test quote.",
    attribution: {
      name: "Jane Doe",
      role: "Operations Director",
      company: "Acme Corp",
    },
    cta: { href: "/case-studies/acme", label: "Read full story" },
  });

  assert.ok(html.includes("focus-visible:ring-2"));
  assert.ok(html.includes("focus-visible:ring-accent"));
  assert.ok(html.includes("focus-visible:ring-offset-2"));
});