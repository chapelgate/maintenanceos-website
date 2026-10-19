# Implementation Plan — S35 Help Centre

## Approach
Follow the established blog pattern (S24) for MDX-based content pages:
1. Create content directory with MDX articles
2. Create library for reading/parsing articles
3. Create index page with search
4. Create article page with JSON-LD
5. Update routes and sitemap
6. Add tests

## Technical Decisions
- Use `gray-matter` for frontmatter parsing (consistent with blog)
- Client-side search via vanilla JS (no external dependency)
- Category-based grouping with defined sort order
- JSON-LD: WebPage + BreadcrumbList (consistent with blog)
- Static generation via `generateStaticParams`

## Articles Created (26)
1. getting-started
2. configuring-contractors
3. notification-settings
4. repair-lifecycle
5. safety-latches
6. assigning-repairs
7. contractor-quotes
8. contractor-compliance
9. gas-safety-compliance
10. epc-compliance
11. hmocompliance
12. fire-risk-assessment
13. tenant-portal
14. reports-analytics
15. integration-overview
16. api-quickstart
17. webhook-guide
16. billing-subscriptions
17. user-management
18. data-security
19. troubleshooting-common-issues
20. emergency-procedures
21. accessibility-features
22. mobile-app
23. getting-help
24. release-notes
25. faq

## Categories (in display order)
1. Getting Started
2. Configuration
3. Core Concepts
4. Safety & Compliance
5. Compliance
6. Daily Operations
7. Features
8. Integrations
9. Reports
10. Account & Billing
11. Security & Privacy
12. Troubleshooting
13. Support
14. Product Updates