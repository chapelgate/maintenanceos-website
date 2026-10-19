# S12 Security page trust information

## Constitution
Reuse the existing static page and components. Publish only the planned status authorized by MASTER_PLAN.md S12. Do not claim certification, change infrastructure, or weaken release gates. Roll back by reverting this slice.

## Specification
Visitors can read `Cyber Essentials: PLANNED (target Q2 2027)` with an explicit statement that certification has not been achieved. The security page links to vulnerability disclosure, subprocessors, and status. No new route or runtime behavior.

## Clarification
The target is a plan, not a certification or guaranteed delivery date. Source: C:/Users/Andy/ag-work/wso-masterplan/MASTER_PLAN.md S12, read 2026-10-19.

## Acceptance
Build the static export. Confirm the exported security page contains the planned status and all three links. Resolve each link to an exported HTML file. Check sitemap URLs resolve to exported pages. After green CI and merge, request https://worksmartos.co.uk/security/ and check PLANNED.
