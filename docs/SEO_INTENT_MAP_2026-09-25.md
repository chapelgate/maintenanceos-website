# SEO buyer-intent map — 2026-09-25

**Owner:** MOS Website Manager  
**Scope:** Step 7 — buyer-intent SEO, technical indexing, monitoring  
**Cost rule:** no paid SEO tools, no paid rank tracker, no scheduled GitHub Actions

## Search observations

Public search checks on 2026-09-25 show that the bare product name is crowded. An unrelated live product at `maintenance-os.com` uses the same MaintenanceOS name for letting-agent maintenance software, so Chapelgate must consistently use **MaintenanceOS by Chapelgate** for search identity.

Current high-intent UK results repeatedly use phrases such as `property maintenance software`, `property management software for UK landlords`, `maintenance management software`, `facilities maintenance software`, and maintenance + audience terms such as landlords, letting agents, property managers, and FM teams.

This is an SEO/discoverability observation, not a legal or trademark conclusion.

## Canonical intent map

| Canonical page | Primary intent |
| --- | --- |
| `/` | UK maintenance operations software |
| `/property-maintenance-software/` | property maintenance software UK |
| `/ai-receptionist/` | AI maintenance receptionist |
| `/features/` | maintenance operations software features |
| `/how-it-works/` | maintenance intake workflow software |
| `/industries/landlords/` | property maintenance software for UK landlords |
| `/industries/letting-agents/` | property maintenance software for UK letting agents |
| `/industries/property-managers/` | property maintenance software for UK property managers |
| `/industries/maintenance-companies/` | maintenance management software for UK maintenance companies |
| `/industries/housing-associations/` | housing maintenance software UK |
| `/industries/facilities-management/` | facilities maintenance software UK |
| `/industries/councils/` | council maintenance software UK |
| `/industries/holiday-lets/` | holiday let maintenance software UK |

## Cannibalisation rule

Do not create separate thin pages for every close synonym. `property maintenance software UK`, `maintenance management software UK`, and `property repair management software` belong to the single core `/property-maintenance-software/` page unless future search evidence proves materially different intent.

The existing industry routes own audience-specific intent. Do not duplicate those audiences into near-identical blog or landing pages.

## Current indexing baseline

Repeat and record these exact public searches:
- `"MaintenanceOS by Chapelgate"`
- `"MaintenanceOS" Chapelgate`
- `"UK maintenance operations software" MaintenanceOS`
- `site:seahorse-app-4oasq.ondigitalocean.app MaintenanceOS`

At the Step 7 baseline, no Chapelgate result was observed for the exact branded/site queries checked. Do not invent rank positions when the search engine does not expose stable positions.

## Technical monitoring

Run `npm run seo:monitor`. The monitor verifies live canonical pages return HTTP 200, have unique titles/descriptions, self-canonical URLs, indexable robots state, JSON-LD, and sitemap inclusion. It also verifies `robots.txt` points at the canonical sitemap.

Search-engine indexing/rank observations remain an external public-search check; the repository does not scrape search engines or require a paid rank API.

## Production-domain gate

The DigitalOcean hostname remains the canonical origin until an approved branded production domain exists. A production domain is a launch/brand dependency, not permission to buy a domain or create duplicate hosting.
