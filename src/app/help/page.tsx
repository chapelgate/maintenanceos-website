import type { Metadata } from "next";
import { getAllHelpArticles, getHelpCategories, generateHelpIndexMetadata } from "@/lib/help";
import { contentPageMetadata } from "@/lib/page-meta";
import { contentPageJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { CtaPair } from "@/components/CtaPair";

export async function generateMetadata(): Promise<Metadata> {
  const meta = generateHelpIndexMetadata();
  return contentPageMetadata(meta);
}

export default async function HelpIndexPage() {
  const articles = getAllHelpArticles();
  const categories = getHelpCategories();
  const helpPath = "/help/";
  const jsonLdData = contentPageJsonLd(
    helpPath,
    "Help Centre",
    "Searchable documentation for MaintenanceOS: getting started, repairs, compliance, integrations, and more.",
    [
      { name: "Help Centre", path: helpPath },
    ],
  );

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageHero
        title="Help Centre"
        lede="Searchable documentation for MaintenanceOS: getting started, repairs, compliance, integrations, and more. 26 articles, versioned in git."
      />
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <FunnelPathStrip linked />
        
        {/* Search */}
        <section aria-labelledby="search-heading" className="mb-8" role="search">
          <h2 id="search-heading" className="sr-only">Search Help Articles</h2>
          <div className="relative">
            <label htmlFor="help-search" className="sr-only">Search help articles</label>
            <input
              id="help-search"
              type="search"
              placeholder="Search help articles…"
              className="w-full px-4 py-3 text-base border border-border rounded-[var(--mos-radius-lg)] bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent pl-10"
              aria-controls="help-articles"
              aria-describedby="help-result-count"
              autoComplete="off"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M15 15l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p
            id="help-result-count"
            className="mt-3 text-xs text-muted"
            role="status"
            aria-live="polite"
          >
            {articles.length} article{articles.length === 1 ? "" : "s"}
          </p>
        </section>

        {/* Categories with Articles */}
        <div id="help-articles" role="list" aria-describedby="help-result-count" className="space-y-12">
          {categories.map((category) => {
            const categoryArticles = articles.filter((a) => a.frontmatter.category === category);
            return (
              <section key={category} aria-labelledby={`cat-${category.toLowerCase().replace(/\s+/g, "-")}`} className="space-y-6">
                <h2 id={`cat-${category.toLowerCase().replace(/\s+/g, "-")}`} className="text-xl font-semibold text-ink flex items-center gap-2">
                  <span className="text-accent">{category}</span>
                  <span className="text-sm text-muted font-normal">({categoryArticles.length})</span>
                </h2>
                <div className="space-y-4" role="list">
                  {categoryArticles.map((article) => {
                    const { frontmatter, content } = article;
                    const articleUrl = `/help/${frontmatter.slug}/`;
                    const excerpt = content
                      .replace(/[#*`\[\]]/g, "")
                      .split("\n")
                      .find((line) => line.trim().length > 50) ?? frontmatter.description;
                    const date = new Date(frontmatter.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <article
                        key={frontmatter.slug}
                        role="listitem"
                        className="border border-border rounded-xl p-5 hover:border-accent/50 transition-colors group"
                        data-search-text={`${frontmatter.title} ${frontmatter.description} ${frontmatter.tags.join(" ")} ${content}`.toLowerCase()}
                      >
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs text-accent font-medium">{frontmatter.category}</span>
                          {frontmatter.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-muted border border-border px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {frontmatter.tags.length > 3 && (
                            <span className="text-xs text-muted border border-border px-2 py-0.5 rounded">
                              +{frontmatter.tags.length - 3} more
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-ink mb-1">
                          <a href={articleUrl} className="hover:text-accent underline underline-offset-2 group-hover:text-accent">
                            {frontmatter.title}
                          </a>
                        </h3>
                        <p className="text-sm text-muted mb-3 line-clamp-2">{excerpt}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                          <time dateTime={frontmatter.date}>{date}</time>
                          <span>•</span>
                          <span>{frontmatter.author}</span>
                          <span>•</span>
                          <a
                            href={articleUrl}
                            className="text-accent underline underline-offset-1 hover:text-accent/80 font-medium"
                          >
                            Read article
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* No results message (hidden by default, shown via JS) */}
        <div
          id="help-no-results"
          className="hidden text-center py-12 text-muted"
          data-no-results
          role="status"
          aria-live="polite"
        >
          <p className="text-base font-medium">No matching articles found.</p>
          <p className="mt-1 text-sm">Clear the filter to show every article again.</p>
          <button
            id="help-clear-filter"
            type="button"
            className="mt-4 text-sm font-medium text-accent underline underline-offset-4 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear help filter
          </button>
        </div>

        <section className="border-t border-border pt-8">
          <CtaPair />
        </section>
      </div>

      {/* Client-side search script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const searchInput = document.getElementById('help-search');
              const articlesContainer = document.getElementById('help-articles');
              const noResults = document.getElementById('help-no-results');
              const resultCount = document.getElementById('help-result-count');
              const clearBtn = document.getElementById('help-clear-filter');
              const articles = articlesContainer ? articlesContainer.querySelectorAll('[data-search-text]') : [];
              const total = articles.length;

              if (!searchInput || !articlesContainer) return;

              function applyFilter(query) {
                let visibleCount = 0;
                articles.forEach(function(article) {
                  const searchText = article.getAttribute('data-search-text') || '';
                  const matches = !query || searchText.includes(query);
                  article.style.display = matches ? '' : 'none';
                  if (matches) visibleCount++;
                });
                const categories = articlesContainer.querySelectorAll('section[aria-labelledby^="cat-"]');
                categories.forEach(function(cat) {
                  const catArticles = cat.querySelectorAll('[data-search-text]');
                  let catVisible = 0;
                  catArticles.forEach(function(a) {
                    if (a.style.display !== 'none') catVisible++;
                  });
                  cat.style.display = catVisible > 0 ? '' : 'none';
                });
                if (resultCount) {
                  resultCount.textContent = query
                    ? (visibleCount + ' matching article' + (visibleCount === 1 ? '' : 's'))
                    : (total + ' article' + (total === 1 ? '' : 's'));
                }
                if (noResults) {
                  noResults.style.display = visibleCount === 0 && query ? 'block' : 'none';
                  noResults.classList.toggle('hidden', !(visibleCount === 0 && query));
                }
              }

              searchInput.addEventListener('input', function() {
                applyFilter(this.value.toLowerCase().trim());
              });
              if (clearBtn) {
                clearBtn.addEventListener('click', function() {
                  searchInput.value = '';
                  applyFilter('');
                  searchInput.focus();
                });
              }
            })();
          `,
        }}
      />
    </>
  );
}