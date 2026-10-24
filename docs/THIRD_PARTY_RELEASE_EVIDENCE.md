# Third-party release evidence — maintenanceos-website

## Scope

This record captures deterministic exact-candidate evidence for third-party package and shipped-media licence obligations. It records evidence only; it makes no legal decision, adds no project licence, and does not change the site's proprietary contract-only licence.

Licence route: REUSE-WITH-ATTRIBUTION. MIT/Apache/BSD packages are recorded with their declared licence and source reference so notices and attribution requirements stay visible. LGPL components (Sharp/libvips) are recorded as unresolved — not described as legally cleared.

## Candidate identity

- Source commit: `c4ff3ca3c85d296e557897949c58f2608e29e27b` (2026-10-22)
- `package-lock.json` SHA-256: `f6305aadc0ba7493c2cb3b5bb6d46e263e1c995028eef04cb85fa8282c864d31`
- lockfileVersion: 3
- Root package: `maintenanceos-website` 0.1.0 (private)

## Package evidence (from package-lock.json, lockfileVersion 3)

474 package entries. Declared licences observed:

| Licence | Count |
| --- | --- |
| MIT | 372 |
| Apache-2.0 | 38 |
| ISC | 18 |
| MPL-2.0 | 14 |
| BSD-2-Clause | 9 |
| BSD-3-Clause | 3 |
| 0BSD | 2 |
| LGPL-3.0-or-later | 10 |
| Apache-2.0 AND LGPL-3.0-or-later | 3 |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1 |
| BlueOak-1.0.0 | 1 |
| Python-2.0 | 1 |
| CC-BY-4.0 | 1 |
| CC0-1.0 | 1 |

Every package entry carries a `license` field; no entry is unlicensed/unknown by lockfile metadata.

Direct dependencies (root `package.json`):
- `next` 16.3.8 — dependencies: `sharp` ^0.35.4 (resolved 0.35.5)
- `parse5` 7.3.0
- `pdfjs-dist` 6.3.289
- `react` 19.3.0
- `react-dom` 19.3.0

Dev dependencies: `@axe-core/playwright`, `@playwright/test`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `gray-matter`, `playwright`, `tailwindcss`, `typescript`.

## Sharp / libvips (LGPL — unresolved, not cleared)

`sharp` 0.35.5 — declared licence Apache-2.0, optional dependency of `next`. Source: https://registry.npmjs.org/sharp/-/sharp-0.35.5.tgz. Funds libvips via opencollective.com/libvips.

Sharp's optional platform bindings (`@img/sharp-*`) declare Apache-2.0, but their `sharp-libvips-*` optionalDependencies declare **LGPL-3.0-or-later** (libvips). These copyleft components are present in the lockfile and are **not** redistributed by this site's build output; the redistribution interpretation is **unresolved** and is recorded here for Andy or the solicitor, not described as cleared.

Sharp libvips platform packages (version 1.3.4, all optional):
- `@img/sharp-libvips-darwin-arm64` — LGPL-3.0-or-later
- `@img/sharp-libvips-darwin-x64` — LGPL-3.0-or-later
- `@img/sharp-libvips-linux-arm` — LGPL-3.0-or-later
- `@img/sharp-libvips-linux-arm64` — LGPL-3.0-or-later
- `@img/sharp-libvips-linux-ppc64` — LGPL-3.0-or-later
- `@img/sharp-libvips-linux-riscv64` — LGPL-3.0-or-later
- `@img/sharp-libvips-linux-s390x` — LGPL-3.0-or-later
- `@img/sharp-libvips-linux-x64` — LGPL-3.0-or-later
- `@img/sharp-libvips-linuxmusl-arm64` — LGPL-3.0-or-later
- `@img/sharp-libvips-linuxmusl-x64` — LGPL-3.0-or-later

libvips source: https://opencollective.com/libvips

## Shipped media evidence (public/media/home/SOURCES.md)

Source file preserved unchanged. Self-hosted under `public/media/home/`; static CSP `img-src 'self'` loads them. None are RelicVault assets; none are customer records. The luxury terrace still (`uk-terrace.webp`) was dropped after local review.

| File | Scene | Source | Stated terms |
| --- | --- | --- | --- |
| `office-phone.webp` | Person on a mobile at a desk | Pexels 3760263 (https://www.pexels.com/photo/3760263/) | Pexels License |
| `site-trade.webp` | Tradesperson at an electrical box | Unsplash `_2AlIm-F6pw` (https://unsplash.com/photos/_2AlIm-F6pw) | Unsplash License |
| `uk-row.webp` | Pale gabled UK houses | Max / Unsplash (https://unsplash.com/photos/83w1pQgZ5bs) | Unsplash License |

Encoded with ffmpeg/libwebp (local crops, no Unsplash/Pexels hotlink).

All three referenced shipped files exist on disk; all three source entries resolve.

## Unresolved obligations

- Sharp/libvips LGPL-3.0-or-later redistribution interpretation: not established. Recorded as unresolved; not described as legally cleared.
- No copyleft/source-available/unlicensed obligation is presented as cleared in this record.

## What this record does not do

- Does not add a root licence (LICENSE / LICENSE.md / COPYING unchanged).
- Does not change dependencies, package.json, or package-lock.json.
- Does not download licence data or contact any service.
- Does not resolve legal ambiguity in code.
- Does not touch `src/**`, public media files, deploy/, .do/, .github/, Dockerfile, docker-compose*, .env*, nginx, startup, voice/telephony/product backend/production data.
