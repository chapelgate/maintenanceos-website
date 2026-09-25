# SEO brand/discoverability baseline — 2026-09-25

**Owner:** MOS Website Manager  
**Scope:** brand identity and organic discoverability  
**Cost rule:** no paid SEO tools, no paid monitoring, no scheduled GitHub Actions

## Canonical public identity

- Product name: **MaintenanceOS**
- Search/display identity: **MaintenanceOS by Chapelgate**
- Publisher: **Chapelgate**
- Category: **UK maintenance operations software with AI-assisted intake**
- Current canonical public host: `https://seahorse-app-4oasq.ondigitalocean.app`
- Public status: pre-launch / early access

Use `MaintenanceOS by Chapelgate` where the context is search identity, page title, site name, wordmark attribution, or publisher differentiation. Keep `MaintenanceOS` as the product name in product copy.

## Baseline search observation

Checked 2026-09-25 using public web search.

| Query | Baseline |
| --- | --- |
| `MaintenanceOS` / `Maintenance OS` | Crowded. Unrelated products use the same or near-identical name, including `maintenance-os.com`, `ifbids.com`, and other maintenance-OS products. |
| `MaintenanceOS by Chapelgate` | No indexed Chapelgate result observed. |
| `site:seahorse-app-4oasq.ondigitalocean.app MaintenanceOS` | No indexed result observed. |
| `UK maintenance operations MaintenanceOS` | No Chapelgate result observed in the checked search. |

This is a discoverability/name-collision observation only. It is **not** a legal or trademark assessment.

## Source fixes now required by policy

1. Site titles and Open Graph use `MaintenanceOS by Chapelgate`.
2. Visible header/footer attribute the product to Chapelgate.
3. Organization JSON-LD names `Chapelgate`; WebSite identifies `MaintenanceOS by Chapelgate`; SoftwareApplication remains `MaintenanceOS` with the public brand as an alternate name.
4. Homepage and AI-receptionist copy name the UK maintenance-operations category plainly.
5. `llms.txt` and `llms-full.txt` use the same product/publisher relationship.
6. Robots remain index/follow and sitemap remains exposed.

## Monitoring loop

Repeat these exact queries during the Website Manager SEO cycle and append a dated note when the result materially changes:

- `"MaintenanceOS by Chapelgate"`
- `"MaintenanceOS" Chapelgate`
- `"UK maintenance operations software" MaintenanceOS`
- `site:seahorse-app-4oasq.ondigitalocean.app MaintenanceOS`

Record only observable search results; do not invent rank numbers when the engine does not expose a stable rank.

### Success signals

- Branded query resolves to the Chapelgate MaintenanceOS site.
- Search snippet uses **MaintenanceOS by Chapelgate** rather than an ambiguous bare name.
- The homepage is indexed under the canonical origin.
- Category queries begin surfacing Chapelgate pages for maintenance operations / AI-assisted maintenance intake.
- Unrelated products are not mistaken for Chapelgate in site copy or structured data.

## Production-domain gate

The current canonical origin is the DigitalOcean staging hostname. A stable branded production domain will improve identity and long-term SEO, but no domain purchase or paid service is authorised by this step. When an approved production domain exists, set `NEXT_PUBLIC_SITE_URL`, rebuild, verify canonicals/sitemap/JSON-LD, and retain redirects from the staging origin where the host allows it.

This is a future launch dependency, not permission to create duplicate hosting.
