"use client";

import React, { useState, useMemo, useRef, KeyboardEvent } from "react";

type FaqItem = {
  question: string;
  answer: string;
  category?: "product" | "safety";
  relatedHref?: string;
  relatedLabel?: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

function FaqAccordionComponent({ items }: FaqAccordionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const summaryRefs = useRef<(HTMLElement | null)[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleClearFilter = () => {
    setSearchQuery("");
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, index: number) => {
    const visibleSummaries = summaryRefs.current.filter((ref) => ref !== null);
    const currentVisibleIndex = visibleSummaries.findIndex((ref) => ref === e.currentTarget);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (currentVisibleIndex < visibleSummaries.length - 1) {
          visibleSummaries[currentVisibleIndex + 1]?.focus();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (currentVisibleIndex > 0) {
          visibleSummaries[currentVisibleIndex - 1]?.focus();
        }
        break;
      case "Home":
        e.preventDefault();
        visibleSummaries[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        visibleSummaries[visibleSummaries.length - 1]?.focus();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        setExpandedIndex((prev) => (prev === index ? null : index));
        break;
    }
  };

  return (
    <section className="faq-accordion" aria-labelledby="faq-heading">
      <div
        className="mb-6"
        role="search"
        aria-label="Filter FAQs"
      >
        <label htmlFor="faq-search" className="sr-only">
          Search FAQs
        </label>
        <input
          id="faq-search"
          ref={searchInputRef}
          type="search"
          placeholder="Search FAQs…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 text-base border border-border rounded-[var(--mos-radius-lg)] bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-controls="faq-list"
          aria-describedby="faq-search-hint"
        />
        <p id="faq-search-hint" className="mt-1 text-xs text-muted">
          Type to filter questions. Press Enter on a question to expand.
        </p>
      </div>

      <p
        id="faq-result-count"
        className="mb-3 text-xs text-muted"
        role="status"
        aria-live="polite"
      >
        {searchQuery.trim()
          ? `${filteredItems.length} matching question${filteredItems.length === 1 ? "" : "s"}`
          : `${items.length} question${items.length === 1 ? "" : "s"}`}
      </p>

      <div
        id="faq-list"
        role="list"
        className="space-y-2"
        aria-describedby="faq-result-count"
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const originalIndex = items.indexOf(item);
            return (
              <details
                key={item.question}
                name="mos-faq"
                className="mos-accordion group rounded-[var(--mos-radius-lg)] border border-border bg-surface p-4 transition-all open:bg-paper/50"
                open={expandedIndex === originalIndex}
                onToggle={() => setExpandedIndex(expandedIndex === originalIndex ? null : originalIndex)}
              >
                <summary
                  ref={(el) => {
                    summaryRefs.current[originalIndex] = el;
                  }}
                  className="flex cursor-pointer items-center justify-between text-sm font-semibold text-ink list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
                  onKeyDown={(e) => handleKeyDown(e, originalIndex)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={expandedIndex === originalIndex}
                  aria-controls={`faq-answer-${originalIndex}`}
                >
                  <span>{item.question}</span>
                  <span className="ml-2 text-muted transition-transform group-open:rotate-180 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                <div
                  id={`faq-answer-${originalIndex}`}
                  className="mt-3 pt-3 border-t border-border text-sm leading-relaxed text-muted space-y-2"
                  role="region"
                  aria-labelledby={`faq-question-${originalIndex}`}
                >
                  <p id={`faq-question-${originalIndex}`} className="sr-only">
                    {item.question}
                  </p>
                  <p>{item.answer}</p>
                  {item.relatedHref && item.relatedLabel && (
                    <p className="mt-2 text-xs">
                      <a
                        href={item.relatedHref}
                        className="text-accent underline"
                      >
                        {item.relatedLabel}
                      </a>
                    </p>
                  )}
                </div>
              </details>
            );
          })
        ) : (
          <div
            data-no-results
            className="text-center py-8 text-muted"
            role="status"
            aria-live="polite"
          >
            <p className="text-base font-medium">No matching questions found.</p>
            <p className="mt-1 text-sm">Try a different search term, or clear the filter to show every question again.</p>
            <button
              type="button"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-semibold text-ink hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={handleClearFilter}
            >
              Clear FAQ filter
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return <FaqAccordionComponent items={items} />;
}

export type { FaqItem };