# S22 comparison route repair

OBJECTIVE -> Serve the eight published comparison URLs -> ACCEPTANCE -> HTTP 200, matching canonical and sitemap inclusion -> EVIDENCE -> Live canonical Fixflo URL returned 404 on 2026-10-19 -> NEXT -> Test and correct static parameters and lookup.

Classification: BUG. Estate PR route remains FEATURE as TASK_IMPL.md requires.
Reuse: existing comparison MDX, loader, Next static export, marketingPaths and sitemap generator. No new dependencies or infrastructure.

Scope: correct canonical paths and sitemap. Preserve content. Old unprefixed URLs require permanent redirects, but Next redirects are unsupported by the existing static export and no hosting ingress configuration exists in this repository. Record this deployment boundary explicitly; do not represent a client redirect as HTTP 301/308.

Acceptance: all eight linked paths render, canonical equals requested URL, sitemap includes them. Run failing regression first, TypeScript, lint, full tests, build and export acceptance. CI estate-gate, validate when applicable, webkit-a11y must pass before merge. Live acceptance after deployment.

Rollback: revert this repair PR. Existing release gates remain unchanged.
