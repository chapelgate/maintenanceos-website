# Third-party release evidence — maintenanceos-website

## Scope

This record captures deterministic exact-candidate evidence for third-party package and shipped-media licence obligations. It records evidence only; it makes no legal decision, adds no project licence, and does not change the site's proprietary contract-only licence.

Licence route: REUSE-WITH-ATTRIBUTION. MIT/Apache/BSD packages are recorded with their declared licence and source reference so notices and attribution requirements stay visible. LGPL components (Sharp/libvips) are recorded as unresolved — not described as legally cleared. MPL-2.0 and other non-reuse licences are recorded as unresolved interpretation for Andy or the solicitor.

## Candidate identity

- Source commit: `c4ff3ca3c85d296e557897949c58f2608e29e27b` (2026-10-22)
- `package-lock.json` SHA-256: `f6305aadc0ba7493c2cb3b5bb6d46e263e1c995028eef04cb85fa8282c864d31`
- lockfileVersion: 3
- Root package: `maintenanceos-website` 0.1.0 (private)

## Package evidence (from package-lock.json, lockfileVersion 3)

474 package entries. Every entry carries a declared `license` field and a `resolved` source reference except six nested packages under `@tailwindcss/oxide-wasm32-wasi` (no `resolved` field); those six are recorded with name, version and licence only.

Declared licences observed:

| Licence | Count | Category |
| --- | --- | --- |
| MIT | 372 | reuse |
| Apache-2.0 | 38 | reuse |
| ISC | 18 | unresolved |
| MPL-2.0 | 14 | unresolved |
| LGPL-3.0-or-later | 10 | copyleft/unlicensed |
| BSD-2-Clause | 9 | reuse |
| Apache-2.0 AND LGPL-3.0-or-later | 3 | copyleft/unlicensed |
| BSD-3-Clause | 3 | reuse |
| 0BSD | 2 | reuse |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1 | copyleft/unlicensed |
| BlueOak-1.0.0 | 1 | unresolved |
| CC-BY-4.0 | 1 | unresolved |
| CC0-1.0 | 1 | unresolved |
| Python-2.0 | 1 | unresolved |

Every package entry carries a `license` field; no entry is unlicensed/unknown by lockfile metadata.

## Complete package evidence

| # | Package name | Exact version | Declared licence | Source reference | Category |
| --- | --- | --- | --- | --- | --- |
| 1 | quick-lru | 5.3.0 | MIT | https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.3.0.tgz | reuse |
| 2 | playwright | 4.13.0 | MPL-2.0 | https://registry.npmjs.org/@axe-core/playwright/-/playwright-4.13.0.tgz | unresolved |
| 3 | code-frame | 7.29.7 | MIT | https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz | reuse |
| 4 | compat-data | 7.29.7 | MIT | https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz | reuse |
| 5 | core | 7.29.7 | MIT | https://registry.npmjs.org/@babel/core/-/core-7.29.7.tgz | reuse |
| 6 | semver | 6.3.1 | ISC | https://registry.npmjs.org/semver/-/semver-6.3.1.tgz | unresolved |
| 7 | generator | 7.29.8 | MIT | https://registry.npmjs.org/@babel/generator/-/generator-7.29.8.tgz | reuse |
| 8 | helper-compilation-targets | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.7.tgz | reuse |
| 9 | semver | 6.3.1 | ISC | https://registry.npmjs.org/semver/-/semver-6.3.1.tgz | unresolved |
| 10 | helper-globals | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz | reuse |
| 11 | helper-module-imports | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz | reuse |
| 12 | helper-module-transforms | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.7.tgz | reuse |
| 13 | helper-string-parser | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.7.tgz | reuse |
| 14 | helper-validator-identifier | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz | reuse |
| 15 | helper-validator-option | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz | reuse |
| 16 | helpers | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.7.tgz | reuse |
| 17 | parser | 7.29.9 | MIT | https://registry.npmjs.org/@babel/parser/-/parser-7.29.9.tgz | reuse |
| 18 | template | 7.29.7 | MIT | https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz | reuse |
| 19 | traverse | 7.29.8 | MIT | https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.8.tgz | reuse |
| 20 | types | 7.29.8 | MIT | https://registry.npmjs.org/@babel/types/-/types-7.29.8.tgz | reuse |
| 21 | core | 1.10.0 | MIT | https://registry.npmjs.org/@emnapi/core/-/core-1.10.0.tgz | reuse |
| 22 | runtime | 1.11.3 | MIT | https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.11.3.tgz | reuse |
| 23 | wasi-threads | 1.2.1 | MIT | https://registry.npmjs.org/@emnapi/wasi-threads/-/wasi-threads-1.2.1.tgz | reuse |
| 24 | eslint-utils | 4.10.1 | MIT | https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.10.1.tgz | reuse |
| 25 | eslint-visitor-keys | 3.4.3 | Apache-2.0 | https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz | reuse |
| 26 | regexpp | 4.12.2 | MIT | https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.2.tgz | reuse |
| 27 | config-array | 0.21.2 | Apache-2.0 | https://registry.npmjs.org/@eslint/config-array/-/config-array-0.21.2.tgz | reuse |
| 28 | config-helpers | 0.4.2 | Apache-2.0 | https://registry.npmjs.org/@eslint/config-helpers/-/config-helpers-0.4.2.tgz | reuse |
| 29 | core | 0.17.0 | Apache-2.0 | https://registry.npmjs.org/@eslint/core/-/core-0.17.0.tgz | reuse |
| 30 | eslintrc | 3.3.7 | MIT | https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-3.3.7.tgz | reuse |
| 31 | js | 9.39.5 | MIT | https://registry.npmjs.org/@eslint/js/-/js-9.39.5.tgz | reuse |
| 32 | object-schema | 2.1.7 | Apache-2.0 | https://registry.npmjs.org/@eslint/object-schema/-/object-schema-2.1.7.tgz | reuse |
| 33 | plugin-kit | 0.4.1 | Apache-2.0 | https://registry.npmjs.org/@eslint/plugin-kit/-/plugin-kit-0.4.1.tgz | reuse |
| 34 | core | 0.19.2 | Apache-2.0 | https://registry.npmjs.org/@humanfs/core/-/core-0.19.2.tgz | reuse |
| 35 | node | 0.16.8 | Apache-2.0 | https://registry.npmjs.org/@humanfs/node/-/node-0.16.8.tgz | reuse |
| 36 | types | 0.15.0 | Apache-2.0 | https://registry.npmjs.org/@humanfs/types/-/types-0.15.0.tgz | reuse |
| 37 | module-importer | 1.0.1 | Apache-2.0 | https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz | reuse |
| 38 | retry | 0.4.3 | Apache-2.0 | https://registry.npmjs.org/@humanwhocodes/retry/-/retry-0.4.3.tgz | reuse |
| 39 | colour | 1.1.0 | MIT | https://registry.npmjs.org/@img/colour/-/colour-1.1.0.tgz | reuse |
| 40 | sharp-darwin-arm64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-darwin-arm64/-/sharp-darwin-arm64-0.35.5.tgz | reuse |
| 41 | sharp-darwin-x64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-darwin-x64/-/sharp-darwin-x64-0.35.5.tgz | reuse |
| 42 | sharp-freebsd-wasm32 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-freebsd-wasm32/-/sharp-freebsd-wasm32-0.35.5.tgz | reuse |
| 43 | sharp-libvips-darwin-arm64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.3.4.tgz | copyleft/unlicensed |
| 44 | sharp-libvips-darwin-x64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.3.4.tgz | copyleft/unlicensed |
| 45 | sharp-libvips-linux-arm | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.3.4.tgz | copyleft/unlicensed |
| 46 | sharp-libvips-linux-arm64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.3.4.tgz | copyleft/unlicensed |
| 47 | sharp-libvips-linux-ppc64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-ppc64/-/sharp-libvips-linux-ppc64-1.3.4.tgz | copyleft/unlicensed |
| 48 | sharp-libvips-linux-riscv64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-riscv64/-/sharp-libvips-linux-riscv64-1.3.4.tgz | copyleft/unlicensed |
| 49 | sharp-libvips-linux-s390x | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.3.4.tgz | copyleft/unlicensed |
| 50 | sharp-libvips-linux-x64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.3.4.tgz | copyleft/unlicensed |
| 51 | sharp-libvips-linuxmusl-arm64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.3.4.tgz | copyleft/unlicensed |
| 52 | sharp-libvips-linuxmusl-x64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.3.4.tgz | copyleft/unlicensed |
| 53 | sharp-linux-arm | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-arm/-/sharp-linux-arm-0.35.5.tgz | reuse |
| 54 | sharp-linux-arm64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-arm64/-/sharp-linux-arm64-0.35.5.tgz | reuse |
| 55 | sharp-linux-ppc64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-ppc64/-/sharp-linux-ppc64-0.35.5.tgz | reuse |
| 56 | sharp-linux-riscv64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-riscv64/-/sharp-linux-riscv64-0.35.5.tgz | reuse |
| 57 | sharp-linux-s390x | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-s390x/-/sharp-linux-s390x-0.35.5.tgz | reuse |
| 58 | sharp-linux-x64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-0.35.5.tgz | reuse |
| 59 | sharp-linuxmusl-arm64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linuxmusl-arm64/-/sharp-linuxmusl-arm64-0.35.5.tgz | reuse |
| 60 | sharp-linuxmusl-x64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linuxmusl-x64/-/sharp-linuxmusl-x64-0.35.5.tgz | reuse |
| 61 | sharp-wasm32 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later AND MIT | https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.35.5.tgz | copyleft/unlicensed |
| 62 | sharp-webcontainers-wasm32 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-webcontainers-wasm32/-/sharp-webcontainers-wasm32-0.35.5.tgz | reuse |
| 63 | sharp-win32-arm64 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-win32-arm64/-/sharp-win32-arm64-0.35.5.tgz | copyleft/unlicensed |
| 64 | sharp-win32-ia32 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.35.5.tgz | copyleft/unlicensed |
| 65 | sharp-win32-x64 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.35.5.tgz | copyleft/unlicensed |
| 66 | gen-mapping | 0.3.13 | MIT | https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz | reuse |
| 67 | remapping | 2.3.5 | MIT | https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz | reuse |
| 68 | resolve-uri | 3.1.2 | MIT | https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz | reuse |
| 69 | sourcemap-codec | 1.6.0 | MIT | https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz | reuse |
| 70 | trace-mapping | 0.3.31 | MIT | https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz | reuse |
| 71 | canvas | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas/-/canvas-1.0.10.tgz | reuse |
| 72 | canvas-android-arm64 | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-android-arm64/-/canvas-android-arm64-1.0.10.tgz | reuse |
| 73 | canvas-darwin-arm64 | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-darwin-arm64/-/canvas-darwin-arm64-1.0.10.tgz | reuse |
| 74 | canvas-darwin-x64 | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-darwin-x64/-/canvas-darwin-x64-1.0.10.tgz | reuse |
| 75 | canvas-linux-arm-gnueabihf | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-arm-gnueabihf/-/canvas-linux-arm-gnueabihf-1.0.10.tgz | reuse |
| 76 | canvas-linux-arm64-gnu | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-arm64-gnu/-/canvas-linux-arm64-gnu-1.0.10.tgz | reuse |
| 77 | canvas-linux-arm64-musl | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-arm64-musl/-/canvas-linux-arm64-musl-1.0.10.tgz | reuse |
| 78 | canvas-linux-riscv64-gnu | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-riscv64-gnu/-/canvas-linux-riscv64-gnu-1.0.10.tgz | reuse |
| 79 | canvas-linux-x64-gnu | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-x64-gnu/-/canvas-linux-x64-gnu-1.0.10.tgz | reuse |
| 80 | canvas-linux-x64-musl | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-x64-musl/-/canvas-linux-x64-musl-1.0.10.tgz | reuse |
| 81 | canvas-win32-arm64-msvc | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-win32-arm64-msvc/-/canvas-win32-arm64-msvc-1.0.10.tgz | reuse |
| 82 | canvas-win32-x64-msvc | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-win32-x64-msvc/-/canvas-win32-x64-msvc-1.0.10.tgz | reuse |
| 83 | wasm-runtime | 1.2.4 | MIT | https://registry.npmjs.org/@napi-rs/wasm-runtime/-/wasm-runtime-1.2.4.tgz | reuse |
| 84 | env | 16.3.8 | MIT | https://registry.npmjs.org/@next/env/-/env-16.3.8.tgz | reuse |
| 85 | eslint-plugin-next | 16.4.2 | MIT | https://registry.npmjs.org/@next/eslint-plugin-next/-/eslint-plugin-next-16.4.2.tgz | reuse |
| 86 | eslint-utils | 4.9.1 | MIT | https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.9.1.tgz | reuse |
| 87 | eslint-visitor-keys | 3.4.3 | Apache-2.0 | https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz | reuse |
| 88 | swc-darwin-arm64 | 16.3.8 | MIT | https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-16.3.8.tgz | reuse |
| 89 | swc-darwin-x64 | 16.3.8 | MIT | https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-16.3.8.tgz | reuse |
| 90 | swc-linux-arm64-gnu | 16.3.8 | MIT | https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-16.3.8.tgz | reuse |
| 91 | swc-linux-arm64-musl | 16.3.8 | MIT | https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-16.3.8.tgz | reuse |
| 92 | swc-linux-x64-gnu | 16.3.8 | MIT | https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-16.3.8.tgz | reuse |
| 93 | swc-linux-x64-musl | 16.3.8 | MIT | https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-16.3.8.tgz | reuse |
| 94 | swc-win32-arm64-msvc | 16.3.8 | MIT | https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-16.3.8.tgz | reuse |
| 95 | swc-win32-x64-msvc | 16.3.8 | MIT | https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-16.3.8.tgz | reuse |
| 96 | fs.scandir | 2.1.5 | MIT | https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz | reuse |
| 97 | fs.stat | 2.0.5 | MIT | https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz | reuse |
| 98 | fs.walk | 1.2.8 | MIT | https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz | reuse |
| 99 | is-core-module | 1.0.39 | MIT | https://registry.npmjs.org/@nolyfill/is-core-module/-/is-core-module-1.0.39.tgz | reuse |
| 100 | test | 1.63.0 | Apache-2.0 | https://registry.npmjs.org/@playwright/test/-/test-1.63.0.tgz | reuse |
| 101 | scc | 1.1.0 | MIT | https://registry.npmjs.org/@rtsao/scc/-/scc-1.1.0.tgz | reuse |
| 102 | helpers | 0.5.23 | Apache-2.0 | https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.23.tgz | reuse |
| 103 | node | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/node/-/node-4.3.3.tgz | reuse |
| 104 | oxide | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide/-/oxide-4.3.3.tgz | reuse |
| 105 | oxide-android-arm64 | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-android-arm64/-/oxide-android-arm64-4.3.3.tgz | reuse |
| 106 | oxide-darwin-arm64 | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-darwin-arm64/-/oxide-darwin-arm64-4.3.3.tgz | reuse |
| 107 | oxide-darwin-x64 | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-darwin-x64/-/oxide-darwin-x64-4.3.3.tgz | reuse |
| 108 | oxide-freebsd-x64 | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-freebsd-x64/-/oxide-freebsd-x64-4.3.3.tgz | reuse |
| 109 | oxide-linux-arm-gnueabihf | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-arm-gnueabihf/-/oxide-linux-arm-gnueabihf-4.3.3.tgz | reuse |
| 110 | oxide-linux-arm64-gnu | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-gnu/-/oxide-linux-arm64-gnu-4.3.3.tgz | reuse |
| 111 | oxide-linux-arm64-musl | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-musl/-/oxide-linux-arm64-musl-4.3.3.tgz | reuse |
| 112 | oxide-linux-x64-gnu | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-gnu/-/oxide-linux-x64-gnu-4.3.3.tgz | reuse |
| 113 | oxide-linux-x64-musl | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-musl/-/oxide-linux-x64-musl-4.3.3.tgz | reuse |
| 114 | oxide-wasm32-wasi | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.3.3.tgz | reuse |
| 115 | core | 1.11.1 | MIT | (no resolved URL — nested dependency) | reuse |
| 116 | runtime | 1.11.1 | MIT | (no resolved URL — nested dependency) | reuse |
| 117 | wasi-threads | 1.2.2 | MIT | (no resolved URL — nested dependency) | reuse |
| 118 | wasm-runtime | 1.1.4 | MIT | (no resolved URL — nested dependency) | reuse |
| 119 | wasm-util | 0.10.2 | MIT | (no resolved URL — nested dependency) | reuse |
| 120 | tslib | 2.8.1 | 0BSD | (no resolved URL — nested dependency) | reuse |
| 121 | oxide-win32-arm64-msvc | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-win32-arm64-msvc/-/oxide-win32-arm64-msvc-4.3.3.tgz | reuse |
| 122 | oxide-win32-x64-msvc | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-4.3.3.tgz | reuse |
| 123 | postcss | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/postcss/-/postcss-4.3.3.tgz | reuse |
| 124 | wasm-util | 0.10.4 | MIT | https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.4.tgz | reuse |
| 125 | estree | 1.0.9 | MIT | https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz | reuse |
| 126 | json-schema | 7.0.15 | MIT | https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz | reuse |
| 127 | json5 | 0.0.29 | MIT | https://registry.npmjs.org/@types/json5/-/json5-0.0.29.tgz | reuse |
| 128 | node | 24.19.0 | MIT | https://registry.npmjs.org/@types/node/-/node-24.19.0.tgz | reuse |
| 129 | react | 19.3.0 | MIT | https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz | reuse |
| 130 | react-dom | 19.3.0 | MIT | https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz | reuse |
| 131 | eslint-plugin | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/eslint-plugin/-/eslint-plugin-8.70.1.tgz | reuse |
| 132 | ignore | 7.0.10 | MIT | https://registry.npmjs.org/ignore/-/ignore-7.0.10.tgz | reuse |
| 133 | parser | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/parser/-/parser-8.70.1.tgz | reuse |
| 134 | project-service | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/project-service/-/project-service-8.70.1.tgz | reuse |
| 135 | scope-manager | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/scope-manager/-/scope-manager-8.70.1.tgz | reuse |
| 136 | tsconfig-utils | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/tsconfig-utils/-/tsconfig-utils-8.70.1.tgz | reuse |
| 137 | type-utils | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/type-utils/-/type-utils-8.70.1.tgz | reuse |
| 138 | types | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/types/-/types-8.70.1.tgz | reuse |
| 139 | typescript-estree | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/typescript-estree/-/typescript-estree-8.70.1.tgz | reuse |
| 140 | balanced-match | 4.0.4 | MIT | https://registry.npmjs.org/balanced-match/-/balanced-match-4.0.4.tgz | reuse |
| 141 | brace-expansion | 5.0.12 | MIT | https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.12.tgz | reuse |
| 142 | minimatch | 10.2.6 | BlueOak-1.0.0 | https://registry.npmjs.org/minimatch/-/minimatch-10.2.6.tgz | unresolved |
| 143 | utils | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/utils/-/utils-8.70.1.tgz | reuse |
| 144 | visitor-keys | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/visitor-keys/-/visitor-keys-8.70.1.tgz | reuse |
| 145 | eslint-visitor-keys | 5.0.1 | Apache-2.0 | https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-5.0.1.tgz | reuse |
| 146 | resolver-binding-android-arm-eabi | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-android-arm-eabi/-/resolver-binding-android-arm-eabi-1.12.2.tgz | reuse |
| 147 | resolver-binding-android-arm64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-android-arm64/-/resolver-binding-android-arm64-1.12.2.tgz | reuse |
| 148 | resolver-binding-darwin-arm64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-darwin-arm64/-/resolver-binding-darwin-arm64-1.12.2.tgz | reuse |
| 149 | resolver-binding-darwin-x64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-darwin-x64/-/resolver-binding-darwin-x64-1.12.2.tgz | reuse |
| 150 | resolver-binding-freebsd-x64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-freebsd-x64/-/resolver-binding-freebsd-x64-1.12.2.tgz | reuse |
| 151 | resolver-binding-linux-arm-gnueabihf | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-gnueabihf/-/resolver-binding-linux-arm-gnueabihf-1.12.2.tgz | reuse |
| 152 | resolver-binding-linux-arm-musleabihf | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-musleabihf/-/resolver-binding-linux-arm-musleabihf-1.12.2.tgz | reuse |
| 153 | resolver-binding-linux-arm64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-gnu/-/resolver-binding-linux-arm64-gnu-1.12.2.tgz | reuse |
| 154 | resolver-binding-linux-arm64-musl | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-musl/-/resolver-binding-linux-arm64-musl-1.12.2.tgz | reuse |
| 155 | resolver-binding-linux-loong64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-loong64-gnu/-/resolver-binding-linux-loong64-gnu-1.12.2.tgz | reuse |
| 156 | resolver-binding-linux-loong64-musl | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-loong64-musl/-/resolver-binding-linux-loong64-musl-1.12.2.tgz | reuse |
| 157 | resolver-binding-linux-ppc64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-ppc64-gnu/-/resolver-binding-linux-ppc64-gnu-1.12.2.tgz | reuse |
| 158 | resolver-binding-linux-riscv64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-gnu/-/resolver-binding-linux-riscv64-gnu-1.12.2.tgz | reuse |
| 159 | resolver-binding-linux-riscv64-musl | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-musl/-/resolver-binding-linux-riscv64-musl-1.12.2.tgz | reuse |
| 160 | resolver-binding-linux-s390x-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-s390x-gnu/-/resolver-binding-linux-s390x-gnu-1.12.2.tgz | reuse |
| 161 | resolver-binding-linux-x64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-gnu/-/resolver-binding-linux-x64-gnu-1.12.2.tgz | reuse |
| 162 | resolver-binding-linux-x64-musl | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-musl/-/resolver-binding-linux-x64-musl-1.12.2.tgz | reuse |
| 163 | resolver-binding-openharmony-arm64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-openharmony-arm64/-/resolver-binding-openharmony-arm64-1.12.2.tgz | reuse |
| 164 | resolver-binding-wasm32-wasi | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-wasm32-wasi/-/resolver-binding-wasm32-wasi-1.12.2.tgz | reuse |
| 165 | runtime | 1.10.0 | MIT | https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.10.0.tgz | reuse |
| 166 | resolver-binding-win32-arm64-msvc | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-win32-arm64-msvc/-/resolver-binding-win32-arm64-msvc-1.12.2.tgz | reuse |
| 167 | resolver-binding-win32-ia32-msvc | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-win32-ia32-msvc/-/resolver-binding-win32-ia32-msvc-1.12.2.tgz | reuse |
| 168 | resolver-binding-win32-x64-msvc | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-win32-x64-msvc/-/resolver-binding-win32-x64-msvc-1.12.2.tgz | reuse |
| 169 | acorn | 8.18.0 | MIT | https://registry.npmjs.org/acorn/-/acorn-8.18.0.tgz | reuse |
| 170 | acorn-jsx | 5.3.2 | MIT | https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz | reuse |
| 171 | ajv | 6.15.0 | MIT | https://registry.npmjs.org/ajv/-/ajv-6.15.0.tgz | reuse |
| 172 | ansi-styles | 4.3.0 | MIT | https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz | reuse |
| 173 | argparse | 2.0.1 | Python-2.0 | https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz | unresolved |
| 174 | aria-query | 5.3.2 | Apache-2.0 | https://registry.npmjs.org/aria-query/-/aria-query-5.3.2.tgz | reuse |
| 175 | array-buffer-byte-length | 1.0.2 | MIT | https://registry.npmjs.org/array-buffer-byte-length/-/array-buffer-byte-length-1.0.2.tgz | reuse |
| 176 | array-includes | 3.2.0 | MIT | https://registry.npmjs.org/array-includes/-/array-includes-3.2.0.tgz | reuse |
| 177 | array.prototype.findlast | 1.2.5 | MIT | https://registry.npmjs.org/array.prototype.findlast/-/array.prototype.findlast-1.2.5.tgz | reuse |
| 178 | array.prototype.findlastindex | 1.2.6 | MIT | https://registry.npmjs.org/array.prototype.findlastindex/-/array.prototype.findlastindex-1.2.6.tgz | reuse |
| 179 | array.prototype.flat | 1.3.3 | MIT | https://registry.npmjs.org/array.prototype.flat/-/array.prototype.flat-1.3.3.tgz | reuse |
| 180 | array.prototype.flatmap | 1.3.3 | MIT | https://registry.npmjs.org/array.prototype.flatmap/-/array.prototype.flatmap-1.3.3.tgz | reuse |
| 181 | array.prototype.tosorted | 1.1.4 | MIT | https://registry.npmjs.org/array.prototype.tosorted/-/array.prototype.tosorted-1.1.4.tgz | reuse |
| 182 | arraybuffer.prototype.slice | 1.0.4 | MIT | https://registry.npmjs.org/arraybuffer.prototype.slice/-/arraybuffer.prototype.slice-1.0.4.tgz | reuse |
| 183 | ast-types-flow | 0.0.8 | MIT | https://registry.npmjs.org/ast-types-flow/-/ast-types-flow-0.0.8.tgz | reuse |
| 184 | async-function | 1.0.0 | MIT | https://registry.npmjs.org/async-function/-/async-function-1.0.0.tgz | reuse |
| 185 | available-typed-arrays | 1.0.7 | MIT | https://registry.npmjs.org/available-typed-arrays/-/available-typed-arrays-1.0.7.tgz | reuse |
| 186 | axe-core | 4.13.0 | MPL-2.0 | https://registry.npmjs.org/axe-core/-/axe-core-4.13.0.tgz | unresolved |
| 187 | axobject-query | 4.1.0 | Apache-2.0 | https://registry.npmjs.org/axobject-query/-/axobject-query-4.1.0.tgz | reuse |
| 188 | balanced-match | 1.0.2 | MIT | https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz | reuse |
| 189 | baseline-browser-mapping | 2.11.26 | Apache-2.0 | https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.26.tgz | reuse |
| 190 | brace-expansion | 1.1.21 | MIT | https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.21.tgz | reuse |
| 191 | braces | 3.0.3 | MIT | https://registry.npmjs.org/braces/-/braces-3.0.3.tgz | reuse |
| 192 | browserslist | 4.29.1 | MIT | https://registry.npmjs.org/browserslist/-/browserslist-4.29.1.tgz | reuse |
| 193 | call-bind | 1.0.9 | MIT | https://registry.npmjs.org/call-bind/-/call-bind-1.0.9.tgz | reuse |
| 194 | call-bind-apply-helpers | 1.0.2 | MIT | https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz | reuse |
| 195 | call-bound | 1.0.4 | MIT | https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz | reuse |
| 196 | callsites | 3.1.0 | MIT | https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz | reuse |
| 197 | caniuse-lite | 1.0.30001810 | CC-BY-4.0 | https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001810.tgz | unresolved |
| 198 | chalk | 4.1.2 | MIT | https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz | reuse |
| 199 | client-only | 0.0.1 | MIT | https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz | reuse |
| 200 | color-convert | 2.0.1 | MIT | https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz | reuse |
| 201 | color-name | 1.1.4 | MIT | https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz | reuse |
| 202 | concat-map | 0.0.1 | MIT | https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz | reuse |
| 203 | convert-source-map | 2.0.0 | MIT | https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz | reuse |
| 204 | cross-spawn | 7.0.6 | MIT | https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz | reuse |
| 205 | csstype | 3.2.3 | MIT | https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz | reuse |
| 206 | damerau-levenshtein | 1.0.8 | BSD-2-Clause | https://registry.npmjs.org/damerau-levenshtein/-/damerau-levenshtein-1.0.8.tgz | reuse |
| 207 | data-view-buffer | 1.0.2 | MIT | https://registry.npmjs.org/data-view-buffer/-/data-view-buffer-1.0.2.tgz | reuse |
| 208 | data-view-byte-length | 1.0.2 | MIT | https://registry.npmjs.org/data-view-byte-length/-/data-view-byte-length-1.0.2.tgz | reuse |
| 209 | data-view-byte-offset | 1.0.1 | MIT | https://registry.npmjs.org/data-view-byte-offset/-/data-view-byte-offset-1.0.1.tgz | reuse |
| 210 | debug | 4.4.3 | MIT | https://registry.npmjs.org/debug/-/debug-4.4.3.tgz | reuse |
| 211 | deep-is | 0.1.4 | MIT | https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz | reuse |
| 212 | define-data-property | 1.1.4 | MIT | https://registry.npmjs.org/define-data-property/-/define-data-property-1.1.4.tgz | reuse |
| 213 | define-properties | 1.2.1 | MIT | https://registry.npmjs.org/define-properties/-/define-properties-1.2.1.tgz | reuse |
| 214 | detect-libc | 2.1.2 | Apache-2.0 | https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz | reuse |
| 215 | doctrine | 2.1.0 | Apache-2.0 | https://registry.npmjs.org/doctrine/-/doctrine-2.1.0.tgz | reuse |
| 216 | dunder-proto | 1.0.1 | MIT | https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz | reuse |
| 217 | electron-to-chromium | 1.5.439 | ISC | https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.439.tgz | unresolved |
| 218 | emoji-regex | 9.2.2 | MIT | https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz | reuse |
| 219 | enhanced-resolve | 5.25.1 | MIT | https://registry.npmjs.org/enhanced-resolve/-/enhanced-resolve-5.25.1.tgz | reuse |
| 220 | entities | 6.0.1 | BSD-2-Clause | https://registry.npmjs.org/entities/-/entities-6.0.1.tgz | reuse |
| 221 | es-abstract | 1.24.2 | MIT | https://registry.npmjs.org/es-abstract/-/es-abstract-1.24.2.tgz | reuse |
| 222 | es-abstract-get | 1.0.0 | MIT | https://registry.npmjs.org/es-abstract-get/-/es-abstract-get-1.0.0.tgz | reuse |
| 223 | es-define-property | 1.0.1 | MIT | https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz | reuse |
| 224 | es-errors | 1.3.0 | MIT | https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz | reuse |
| 225 | es-iterator-helpers | 1.4.0 | MIT | https://registry.npmjs.org/es-iterator-helpers/-/es-iterator-helpers-1.4.0.tgz | reuse |
| 226 | es-object-atoms | 1.1.2 | MIT | https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz | reuse |
| 227 | es-set-tostringtag | 2.1.0 | MIT | https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz | reuse |
| 228 | es-shim-unscopables | 1.1.0 | MIT | https://registry.npmjs.org/es-shim-unscopables/-/es-shim-unscopables-1.1.0.tgz | reuse |
| 229 | es-to-primitive | 1.3.4 | MIT | https://registry.npmjs.org/es-to-primitive/-/es-to-primitive-1.3.4.tgz | reuse |
| 230 | escalade | 3.2.0 | MIT | https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz | reuse |
| 231 | escape-string-regexp | 4.0.0 | MIT | https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz | reuse |
| 232 | eslint | 9.39.5 | MIT | https://registry.npmjs.org/eslint/-/eslint-9.39.5.tgz | reuse |
| 233 | eslint-config-next | 16.4.2 | MIT | https://registry.npmjs.org/eslint-config-next/-/eslint-config-next-16.4.2.tgz | reuse |
| 234 | eslint-import-resolver-typescript | 3.10.1 | ISC | https://registry.npmjs.org/eslint-import-resolver-typescript/-/eslint-import-resolver-typescript-3.10.1.tgz | unresolved |
| 235 | eslint-plugin-import | 2.32.0 | MIT | https://registry.npmjs.org/eslint-plugin-import/-/eslint-plugin-import-2.32.0.tgz | reuse |
| 236 | debug | 3.2.7 | MIT | https://registry.npmjs.org/debug/-/debug-3.2.7.tgz | reuse |
| 237 | eslint-plugin-jsx-a11y | 6.10.2 | MIT | https://registry.npmjs.org/eslint-plugin-jsx-a11y/-/eslint-plugin-jsx-a11y-6.10.2.tgz | reuse |
| 238 | eslint-plugin-react | 7.37.5 | MIT | https://registry.npmjs.org/eslint-plugin-react/-/eslint-plugin-react-7.37.5.tgz | reuse |
| 239 | globals | 16.4.0 | MIT | https://registry.npmjs.org/globals/-/globals-16.4.0.tgz | reuse |
| 240 | semver | 6.3.1 | ISC | https://registry.npmjs.org/semver/-/semver-6.3.1.tgz | unresolved |
| 241 | eslint-import-resolver-node | 0.3.10 | MIT | https://registry.npmjs.org/eslint-import-resolver-node/-/eslint-import-resolver-node-0.3.10.tgz | reuse |
| 242 | debug | 3.2.7 | MIT | https://registry.npmjs.org/debug/-/debug-3.2.7.tgz | reuse |
| 243 | eslint-module-utils | 2.14.0 | MIT | https://registry.npmjs.org/eslint-module-utils/-/eslint-module-utils-2.14.0.tgz | reuse |
| 244 | debug | 3.2.7 | MIT | https://registry.npmjs.org/debug/-/debug-3.2.7.tgz | reuse |
| 245 | eslint-plugin-react-hooks | 7.1.1 | MIT | https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-7.1.1.tgz | reuse |
| 246 | eslint-scope | 8.4.0 | BSD-2-Clause | https://registry.npmjs.org/eslint-scope/-/eslint-scope-8.4.0.tgz | reuse |
| 247 | eslint-visitor-keys | 4.2.1 | Apache-2.0 | https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-4.2.1.tgz | reuse |
| 248 | espree | 10.4.0 | BSD-2-Clause | https://registry.npmjs.org/espree/-/espree-10.4.0.tgz | reuse |
| 249 | esprima | 4.0.1 | BSD-2-Clause | https://registry.npmjs.org/esprima/-/esprima-4.0.1.tgz | reuse |
| 250 | esquery | 1.7.0 | BSD-3-Clause | https://registry.npmjs.org/esquery/-/esquery-1.7.0.tgz | reuse |
| 251 | esrecurse | 4.3.0 | BSD-2-Clause | https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz | reuse |
| 252 | estraverse | 5.3.0 | BSD-2-Clause | https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz | reuse |
| 253 | esutils | 2.0.3 | BSD-2-Clause | https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz | reuse |
| 254 | extend-shallow | 2.0.1 | MIT | https://registry.npmjs.org/extend-shallow/-/extend-shallow-2.0.1.tgz | reuse |
| 255 | fast-deep-equal | 3.1.3 | MIT | https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz | reuse |
| 256 | fast-glob | 3.3.1 | MIT | https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.1.tgz | reuse |
| 257 | glob-parent | 5.1.2 | ISC | https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz | unresolved |
| 258 | fast-json-stable-stringify | 2.1.0 | MIT | https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz | reuse |
| 259 | fast-levenshtein | 2.0.6 | MIT | https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz | reuse |
| 260 | fastq | 1.20.3 | ISC | https://registry.npmjs.org/fastq/-/fastq-1.20.3.tgz | unresolved |
| 261 | file-entry-cache | 8.0.0 | MIT | https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-8.0.0.tgz | reuse |
| 262 | fill-range | 7.1.1 | MIT | https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz | reuse |
| 263 | find-up | 5.0.0 | MIT | https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz | reuse |
| 264 | flat-cache | 4.0.1 | MIT | https://registry.npmjs.org/flat-cache/-/flat-cache-4.0.1.tgz | reuse |
| 265 | flatted | 3.4.4 | ISC | https://registry.npmjs.org/flatted/-/flatted-3.4.4.tgz | unresolved |
| 266 | for-each | 0.3.5 | MIT | https://registry.npmjs.org/for-each/-/for-each-0.3.5.tgz | reuse |
| 267 | function-bind | 1.1.2 | MIT | https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz | reuse |
| 268 | function.prototype.name | 1.2.0 | MIT | https://registry.npmjs.org/function.prototype.name/-/function.prototype.name-1.2.0.tgz | reuse |
| 269 | functions-have-names | 1.2.3 | MIT | https://registry.npmjs.org/functions-have-names/-/functions-have-names-1.2.3.tgz | reuse |
| 270 | generator-function | 2.0.1 | MIT | https://registry.npmjs.org/generator-function/-/generator-function-2.0.1.tgz | reuse |
| 271 | gensync | 1.0.0-beta.2 | MIT | https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz | reuse |
| 272 | get-intrinsic | 1.3.0 | MIT | https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz | reuse |
| 273 | get-proto | 1.0.1 | MIT | https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz | reuse |
| 274 | get-symbol-description | 1.1.0 | MIT | https://registry.npmjs.org/get-symbol-description/-/get-symbol-description-1.1.0.tgz | reuse |
| 275 | get-tsconfig | 4.14.3 | MIT | https://registry.npmjs.org/get-tsconfig/-/get-tsconfig-4.14.3.tgz | reuse |
| 276 | glob-parent | 6.0.2 | ISC | https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz | unresolved |
| 277 | globals | 14.0.0 | MIT | https://registry.npmjs.org/globals/-/globals-14.0.0.tgz | reuse |
| 278 | globalthis | 1.0.4 | MIT | https://registry.npmjs.org/globalthis/-/globalthis-1.0.4.tgz | reuse |
| 279 | gopd | 1.2.0 | MIT | https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz | reuse |
| 280 | graceful-fs | 4.2.11 | ISC | https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz | unresolved |
| 281 | gray-matter | 4.0.3 | MIT | https://registry.npmjs.org/gray-matter/-/gray-matter-4.0.3.tgz | reuse |
| 282 | argparse | 1.0.10 | MIT | https://registry.npmjs.org/argparse/-/argparse-1.0.10.tgz | reuse |
| 283 | js-yaml | 3.15.2 | MIT | https://registry.npmjs.org/js-yaml/-/js-yaml-3.15.2.tgz | reuse |
| 284 | has-bigints | 1.1.0 | MIT | https://registry.npmjs.org/has-bigints/-/has-bigints-1.1.0.tgz | reuse |
| 285 | has-flag | 4.0.0 | MIT | https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz | reuse |
| 286 | has-property-descriptors | 1.0.2 | MIT | https://registry.npmjs.org/has-property-descriptors/-/has-property-descriptors-1.0.2.tgz | reuse |
| 287 | has-proto | 1.2.0 | MIT | https://registry.npmjs.org/has-proto/-/has-proto-1.2.0.tgz | reuse |
| 288 | has-symbols | 1.1.0 | MIT | https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz | reuse |
| 289 | has-tostringtag | 1.0.2 | MIT | https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz | reuse |
| 290 | hasown | 2.0.4 | MIT | https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz | reuse |
| 291 | hermes-estree | 0.25.1 | MIT | https://registry.npmjs.org/hermes-estree/-/hermes-estree-0.25.1.tgz | reuse |
| 292 | hermes-parser | 0.25.1 | MIT | https://registry.npmjs.org/hermes-parser/-/hermes-parser-0.25.1.tgz | reuse |
| 293 | ignore | 5.3.2 | MIT | https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz | reuse |
| 294 | import-fresh | 3.3.1 | MIT | https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz | reuse |
| 295 | imurmurhash | 0.1.4 | MIT | https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz | reuse |
| 296 | internal-slot | 1.1.0 | MIT | https://registry.npmjs.org/internal-slot/-/internal-slot-1.1.0.tgz | reuse |
| 297 | is-array-buffer | 3.0.5 | MIT | https://registry.npmjs.org/is-array-buffer/-/is-array-buffer-3.0.5.tgz | reuse |
| 298 | is-async-function | 2.1.1 | MIT | https://registry.npmjs.org/is-async-function/-/is-async-function-2.1.1.tgz | reuse |
| 299 | is-bigint | 1.1.0 | MIT | https://registry.npmjs.org/is-bigint/-/is-bigint-1.1.0.tgz | reuse |
| 300 | is-boolean-object | 1.2.2 | MIT | https://registry.npmjs.org/is-boolean-object/-/is-boolean-object-1.2.2.tgz | reuse |
| 301 | is-bun-module | 2.0.0 | MIT | https://registry.npmjs.org/is-bun-module/-/is-bun-module-2.0.0.tgz | reuse |
| 302 | is-callable | 1.2.7 | MIT | https://registry.npmjs.org/is-callable/-/is-callable-1.2.7.tgz | reuse |
| 303 | is-core-module | 2.17.0 | MIT | https://registry.npmjs.org/is-core-module/-/is-core-module-2.17.0.tgz | reuse |
| 304 | is-data-view | 1.0.2 | MIT | https://registry.npmjs.org/is-data-view/-/is-data-view-1.0.2.tgz | reuse |
| 305 | is-date-object | 1.1.0 | MIT | https://registry.npmjs.org/is-date-object/-/is-date-object-1.1.0.tgz | reuse |
| 306 | is-document.all | 1.0.0 | MIT | https://registry.npmjs.org/is-document.all/-/is-document.all-1.0.0.tgz | reuse |
| 307 | is-extendable | 0.1.1 | MIT | https://registry.npmjs.org/is-extendable/-/is-extendable-0.1.1.tgz | reuse |
| 308 | is-extglob | 2.1.1 | MIT | https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz | reuse |
| 309 | is-finalizationregistry | 1.1.1 | MIT | https://registry.npmjs.org/is-finalizationregistry/-/is-finalizationregistry-1.1.1.tgz | reuse |
| 310 | is-generator-function | 1.1.2 | MIT | https://registry.npmjs.org/is-generator-function/-/is-generator-function-1.1.2.tgz | reuse |
| 311 | is-glob | 4.0.3 | MIT | https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz | reuse |
| 312 | is-map | 2.0.3 | MIT | https://registry.npmjs.org/is-map/-/is-map-2.0.3.tgz | reuse |
| 313 | is-negative-zero | 2.0.3 | MIT | https://registry.npmjs.org/is-negative-zero/-/is-negative-zero-2.0.3.tgz | reuse |
| 314 | is-number | 7.0.0 | MIT | https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz | reuse |
| 315 | is-number-object | 1.1.1 | MIT | https://registry.npmjs.org/is-number-object/-/is-number-object-1.1.1.tgz | reuse |
| 316 | is-regex | 1.2.1 | MIT | https://registry.npmjs.org/is-regex/-/is-regex-1.2.1.tgz | reuse |
| 317 | is-set | 2.0.3 | MIT | https://registry.npmjs.org/is-set/-/is-set-2.0.3.tgz | reuse |
| 318 | is-shared-array-buffer | 1.0.4 | MIT | https://registry.npmjs.org/is-shared-array-buffer/-/is-shared-array-buffer-1.0.4.tgz | reuse |
| 319 | is-string | 1.1.1 | MIT | https://registry.npmjs.org/is-string/-/is-string-1.1.1.tgz | reuse |
| 320 | is-symbol | 1.1.1 | MIT | https://registry.npmjs.org/is-symbol/-/is-symbol-1.1.1.tgz | reuse |
| 321 | is-typed-array | 1.1.15 | MIT | https://registry.npmjs.org/is-typed-array/-/is-typed-array-1.1.15.tgz | reuse |
| 322 | is-weakmap | 2.0.2 | MIT | https://registry.npmjs.org/is-weakmap/-/is-weakmap-2.0.2.tgz | reuse |
| 323 | is-weakref | 1.1.1 | MIT | https://registry.npmjs.org/is-weakref/-/is-weakref-1.1.1.tgz | reuse |
| 324 | is-weakset | 2.0.4 | MIT | https://registry.npmjs.org/is-weakset/-/is-weakset-2.0.4.tgz | reuse |
| 325 | isarray | 2.0.5 | MIT | https://registry.npmjs.org/isarray/-/isarray-2.0.5.tgz | reuse |
| 326 | isexe | 2.0.0 | ISC | https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz | unresolved |
| 327 | iterator.prototype | 1.1.5 | MIT | https://registry.npmjs.org/iterator.prototype/-/iterator.prototype-1.1.5.tgz | reuse |
| 328 | jiti | 2.7.0 | MIT | https://registry.npmjs.org/jiti/-/jiti-2.7.0.tgz | reuse |
| 329 | js-tokens | 4.0.0 | MIT | https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz | reuse |
| 330 | js-yaml | 4.3.2 | MIT | https://registry.npmjs.org/js-yaml/-/js-yaml-4.3.2.tgz | reuse |
| 331 | jsesc | 3.1.0 | MIT | https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz | reuse |
| 332 | json-buffer | 3.0.1 | MIT | https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.1.tgz | reuse |
| 333 | json-schema-traverse | 0.4.1 | MIT | https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz | reuse |
| 334 | json-stable-stringify-without-jsonify | 1.0.1 | MIT | https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz | reuse |
| 335 | json5 | 2.2.3 | MIT | https://registry.npmjs.org/json5/-/json5-2.2.3.tgz | reuse |
| 336 | jsx-ast-utils | 3.3.5 | MIT | https://registry.npmjs.org/jsx-ast-utils/-/jsx-ast-utils-3.3.5.tgz | reuse |
| 337 | keyv | 4.5.4 | MIT | https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz | reuse |
| 338 | kind-of | 6.0.3 | MIT | https://registry.npmjs.org/kind-of/-/kind-of-6.0.3.tgz | reuse |
| 339 | language-subtag-registry | 0.3.23 | CC0-1.0 | https://registry.npmjs.org/language-subtag-registry/-/language-subtag-registry-0.3.23.tgz | unresolved |
| 340 | language-tags | 1.0.9 | MIT | https://registry.npmjs.org/language-tags/-/language-tags-1.0.9.tgz | reuse |
| 341 | levn | 0.4.1 | MIT | https://registry.npmjs.org/levn/-/levn-0.4.1.tgz | reuse |
| 342 | lightningcss | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz | unresolved |
| 343 | lightningcss-android-arm64 | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz | unresolved |
| 344 | lightningcss-darwin-arm64 | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz | unresolved |
| 345 | lightningcss-darwin-x64 | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz | unresolved |
| 346 | lightningcss-freebsd-x64 | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz | unresolved |
| 347 | lightningcss-linux-arm-gnueabihf | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz | unresolved |
| 348 | lightningcss-linux-arm64-gnu | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz | unresolved |
| 349 | lightningcss-linux-arm64-musl | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz | unresolved |
| 350 | lightningcss-linux-x64-gnu | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz | unresolved |
| 351 | lightningcss-linux-x64-musl | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz | unresolved |
| 352 | lightningcss-win32-arm64-msvc | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz | unresolved |
| 353 | lightningcss-win32-x64-msvc | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz | unresolved |
| 354 | locate-path | 6.0.0 | MIT | https://registry.npmjs.org/locate-path/-/locate-path-6.0.0.tgz | reuse |
| 355 | lodash.merge | 4.6.2 | MIT | https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.2.tgz | reuse |
| 356 | loose-envify | 1.4.0 | MIT | https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz | reuse |
| 357 | lru-cache | 5.1.1 | ISC | https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz | unresolved |
| 358 | magic-string | 0.30.21 | MIT | https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz | reuse |
| 359 | math-intrinsics | 1.1.0 | MIT | https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz | reuse |
| 360 | merge2 | 1.4.1 | MIT | https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz | reuse |
| 361 | micromatch | 4.0.8 | MIT | https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz | reuse |
| 362 | minimatch | 3.1.5 | ISC | https://registry.npmjs.org/minimatch/-/minimatch-3.1.5.tgz | unresolved |
| 363 | minimist | 1.2.8 | MIT | https://registry.npmjs.org/minimist/-/minimist-1.2.8.tgz | reuse |
| 364 | ms | 2.1.3 | MIT | https://registry.npmjs.org/ms/-/ms-2.1.3.tgz | reuse |
| 365 | nanoid | 3.3.19 | MIT | https://registry.npmjs.org/nanoid/-/nanoid-3.3.19.tgz | reuse |
| 366 | napi-postinstall | 0.3.4 | MIT | https://registry.npmjs.org/napi-postinstall/-/napi-postinstall-0.3.4.tgz | reuse |
| 367 | natural-compare | 1.4.0 | MIT | https://registry.npmjs.org/natural-compare/-/natural-compare-1.4.0.tgz | reuse |
| 368 | next | 16.3.8 | MIT | https://registry.npmjs.org/next/-/next-16.3.8.tgz | reuse |
| 369 | postcss | 8.5.23 | MIT | https://registry.npmjs.org/postcss/-/postcss-8.5.23.tgz | reuse |
| 370 | node-exports-info | 1.6.2 | MIT | https://registry.npmjs.org/node-exports-info/-/node-exports-info-1.6.2.tgz | reuse |
| 371 | semver | 6.3.1 | ISC | https://registry.npmjs.org/semver/-/semver-6.3.1.tgz | unresolved |
| 372 | node-releases | 2.0.57 | MIT | https://registry.npmjs.org/node-releases/-/node-releases-2.0.57.tgz | reuse |
| 373 | object-assign | 4.1.1 | MIT | https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz | reuse |
| 374 | object-inspect | 1.13.4 | MIT | https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz | reuse |
| 375 | object-keys | 1.1.1 | MIT | https://registry.npmjs.org/object-keys/-/object-keys-1.1.1.tgz | reuse |
| 376 | object.assign | 4.1.7 | MIT | https://registry.npmjs.org/object.assign/-/object.assign-4.1.7.tgz | reuse |
| 377 | object.entries | 1.1.9 | MIT | https://registry.npmjs.org/object.entries/-/object.entries-1.1.9.tgz | reuse |
| 378 | object.fromentries | 2.0.8 | MIT | https://registry.npmjs.org/object.fromentries/-/object.fromentries-2.0.8.tgz | reuse |
| 379 | object.groupby | 1.0.3 | MIT | https://registry.npmjs.org/object.groupby/-/object.groupby-1.0.3.tgz | reuse |
| 380 | object.values | 1.2.1 | MIT | https://registry.npmjs.org/object.values/-/object.values-1.2.1.tgz | reuse |
| 381 | optionator | 0.9.4 | MIT | https://registry.npmjs.org/optionator/-/optionator-0.9.4.tgz | reuse |
| 382 | own-keys | 1.0.2 | MIT | https://registry.npmjs.org/own-keys/-/own-keys-1.0.2.tgz | reuse |
| 383 | p-limit | 3.1.0 | MIT | https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz | reuse |
| 384 | p-locate | 5.0.0 | MIT | https://registry.npmjs.org/p-locate/-/p-locate-5.0.0.tgz | reuse |
| 385 | parent-module | 1.0.1 | MIT | https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz | reuse |
| 386 | parse5 | 7.3.0 | MIT | https://registry.npmjs.org/parse5/-/parse5-7.3.0.tgz | reuse |
| 387 | path-exists | 4.0.0 | MIT | https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz | reuse |
| 388 | path-key | 3.1.1 | MIT | https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz | reuse |
| 389 | path-parse | 1.0.7 | MIT | https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz | reuse |
| 390 | pdfjs-dist | 6.3.289 | Apache-2.0 | https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-6.3.289.tgz | reuse |
| 391 | picocolors | 1.1.1 | ISC | https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz | unresolved |
| 392 | picomatch | 2.3.2 | MIT | https://registry.npmjs.org/picomatch/-/picomatch-2.3.2.tgz | reuse |
| 393 | playwright | 1.63.0 | Apache-2.0 | https://registry.npmjs.org/playwright/-/playwright-1.63.0.tgz | reuse |
| 394 | playwright-core | 1.63.0 | Apache-2.0 | https://registry.npmjs.org/playwright-core/-/playwright-core-1.63.0.tgz | reuse |
| 395 | possible-typed-array-names | 1.1.0 | MIT | https://registry.npmjs.org/possible-typed-array-names/-/possible-typed-array-names-1.1.0.tgz | reuse |
| 396 | postcss | 8.5.28 | MIT | https://registry.npmjs.org/postcss/-/postcss-8.5.28.tgz | reuse |
| 397 | prelude-ls | 1.2.1 | MIT | https://registry.npmjs.org/prelude-ls/-/prelude-ls-1.2.1.tgz | reuse |
| 398 | prop-types | 15.8.1 | MIT | https://registry.npmjs.org/prop-types/-/prop-types-15.8.1.tgz | reuse |
| 399 | punycode | 2.3.1 | MIT | https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz | reuse |
| 400 | queue-microtask | 1.2.3 | MIT | https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz | reuse |
| 401 | react | 19.3.0 | MIT | https://registry.npmjs.org/react/-/react-19.3.0.tgz | reuse |
| 402 | react-dom | 19.3.0 | MIT | https://registry.npmjs.org/react-dom/-/react-dom-19.3.0.tgz | reuse |
| 403 | react-is | 16.13.1 | MIT | https://registry.npmjs.org/react-is/-/react-is-16.13.1.tgz | reuse |
| 404 | reflect.getprototypeof | 1.0.10 | MIT | https://registry.npmjs.org/reflect.getprototypeof/-/reflect.getprototypeof-1.0.10.tgz | reuse |
| 405 | regexp.prototype.flags | 1.5.4 | MIT | https://registry.npmjs.org/regexp.prototype.flags/-/regexp.prototype.flags-1.5.4.tgz | reuse |
| 406 | resolve | 2.0.0-next.7 | MIT | https://registry.npmjs.org/resolve/-/resolve-2.0.0-next.7.tgz | reuse |
| 407 | resolve-from | 4.0.0 | MIT | https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz | reuse |
| 408 | resolve-pkg-maps | 1.0.0 | MIT | https://registry.npmjs.org/resolve-pkg-maps/-/resolve-pkg-maps-1.0.0.tgz | reuse |
| 409 | reusify | 1.1.0 | MIT | https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz | reuse |
| 410 | run-parallel | 1.2.0 | MIT | https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz | reuse |
| 411 | safe-array-concat | 1.1.4 | MIT | https://registry.npmjs.org/safe-array-concat/-/safe-array-concat-1.1.4.tgz | reuse |
| 412 | safe-push-apply | 1.0.0 | MIT | https://registry.npmjs.org/safe-push-apply/-/safe-push-apply-1.0.0.tgz | reuse |
| 413 | safe-regex-test | 1.1.0 | MIT | https://registry.npmjs.org/safe-regex-test/-/safe-regex-test-1.1.0.tgz | reuse |
| 414 | scheduler | 0.28.0 | MIT | https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz | reuse |
| 415 | section-matter | 1.0.0 | MIT | https://registry.npmjs.org/section-matter/-/section-matter-1.0.0.tgz | reuse |
| 416 | semver | 7.8.5 | ISC | https://registry.npmjs.org/semver/-/semver-7.8.5.tgz | unresolved |
| 417 | set-function-length | 1.2.2 | MIT | https://registry.npmjs.org/set-function-length/-/set-function-length-1.2.2.tgz | reuse |
| 418 | set-function-name | 2.0.2 | MIT | https://registry.npmjs.org/set-function-name/-/set-function-name-2.0.2.tgz | reuse |
| 419 | set-proto | 1.0.0 | MIT | https://registry.npmjs.org/set-proto/-/set-proto-1.0.0.tgz | reuse |
| 420 | sharp | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/sharp/-/sharp-0.35.5.tgz | reuse |
| 421 | shebang-command | 2.0.0 | MIT | https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz | reuse |
| 422 | shebang-regex | 3.0.0 | MIT | https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz | reuse |
| 423 | side-channel | 1.1.1 | MIT | https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz | reuse |
| 424 | side-channel-list | 1.0.1 | MIT | https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz | reuse |
| 425 | side-channel-map | 1.0.1 | MIT | https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz | reuse |
| 426 | side-channel-weakmap | 1.0.2 | MIT | https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz | reuse |
| 427 | source-map-js | 1.2.2 | BSD-3-Clause | https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz | reuse |
| 428 | sprintf-js | 1.0.3 | BSD-3-Clause | https://registry.npmjs.org/sprintf-js/-/sprintf-js-1.0.3.tgz | reuse |
| 429 | stable-hash | 0.0.5 | MIT | https://registry.npmjs.org/stable-hash/-/stable-hash-0.0.5.tgz | reuse |
| 430 | stop-iteration-iterator | 1.1.0 | MIT | https://registry.npmjs.org/stop-iteration-iterator/-/stop-iteration-iterator-1.1.0.tgz | reuse |
| 431 | string.prototype.includes | 2.0.1 | MIT | https://registry.npmjs.org/string.prototype.includes/-/string.prototype.includes-2.0.1.tgz | reuse |
| 432 | string.prototype.matchall | 4.1.0 | MIT | https://registry.npmjs.org/string.prototype.matchall/-/string.prototype.matchall-4.1.0.tgz | reuse |
| 433 | string.prototype.repeat | 1.0.0 | MIT | https://registry.npmjs.org/string.prototype.repeat/-/string.prototype.repeat-1.0.0.tgz | reuse |
| 434 | string.prototype.trim | 1.2.11 | MIT | https://registry.npmjs.org/string.prototype.trim/-/string.prototype.trim-1.2.11.tgz | reuse |
| 435 | string.prototype.trimend | 1.0.10 | MIT | https://registry.npmjs.org/string.prototype.trimend/-/string.prototype.trimend-1.0.10.tgz | reuse |
| 436 | string.prototype.trimstart | 1.0.8 | MIT | https://registry.npmjs.org/string.prototype.trimstart/-/string.prototype.trimstart-1.0.8.tgz | reuse |
| 437 | strip-bom | 3.0.0 | MIT | https://registry.npmjs.org/strip-bom/-/strip-bom-3.0.0.tgz | reuse |
| 438 | strip-bom-string | 1.0.0 | MIT | https://registry.npmjs.org/strip-bom-string/-/strip-bom-string-1.0.0.tgz | reuse |
| 439 | strip-json-comments | 3.1.1 | MIT | https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz | reuse |
| 440 | styled-jsx | 5.1.6 | MIT | https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.6.tgz | reuse |
| 441 | supports-color | 7.2.0 | MIT | https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz | reuse |
| 442 | supports-preserve-symlinks-flag | 1.0.0 | MIT | https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz | reuse |
| 443 | tailwindcss | 4.3.3 | MIT | https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.3.3.tgz | reuse |
| 444 | tapable | 2.3.3 | MIT | https://registry.npmjs.org/tapable/-/tapable-2.3.3.tgz | reuse |
| 445 | tinyglobby | 0.2.17 | MIT | https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz | reuse |
| 446 | fdir | 6.5.0 | MIT | https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz | reuse |
| 447 | picomatch | 4.0.7 | MIT | https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz | reuse |
| 448 | to-regex-range | 5.0.1 | MIT | https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz | reuse |
| 449 | ts-api-utils | 2.5.0 | MIT | https://registry.npmjs.org/ts-api-utils/-/ts-api-utils-2.5.0.tgz | reuse |
| 450 | tsconfig-paths | 3.15.0 | MIT | https://registry.npmjs.org/tsconfig-paths/-/tsconfig-paths-3.15.0.tgz | reuse |
| 451 | json5 | 1.0.2 | MIT | https://registry.npmjs.org/json5/-/json5-1.0.2.tgz | reuse |
| 452 | tslib | 2.8.1 | 0BSD | https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz | reuse |
| 453 | type-check | 0.4.0 | MIT | https://registry.npmjs.org/type-check/-/type-check-0.4.0.tgz | reuse |
| 454 | typed-array-buffer | 1.0.3 | MIT | https://registry.npmjs.org/typed-array-buffer/-/typed-array-buffer-1.0.3.tgz | reuse |
| 455 | typed-array-byte-length | 1.0.3 | MIT | https://registry.npmjs.org/typed-array-byte-length/-/typed-array-byte-length-1.0.3.tgz | reuse |
| 456 | typed-array-byte-offset | 1.0.5 | MIT | https://registry.npmjs.org/typed-array-byte-offset/-/typed-array-byte-offset-1.0.5.tgz | reuse |
| 457 | typed-array-length | 1.0.8 | MIT | https://registry.npmjs.org/typed-array-length/-/typed-array-length-1.0.8.tgz | reuse |
| 458 | typescript | 5.9.3 | Apache-2.0 | https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz | reuse |
| 459 | typescript-eslint | 8.70.1 | MIT | https://registry.npmjs.org/typescript-eslint/-/typescript-eslint-8.70.1.tgz | reuse |
| 460 | unbox-primitive | 1.1.0 | MIT | https://registry.npmjs.org/unbox-primitive/-/unbox-primitive-1.1.0.tgz | reuse |
| 461 | undici-types | 7.24.6 | MIT | https://registry.npmjs.org/undici-types/-/undici-types-7.24.6.tgz | reuse |
| 462 | unrs-resolver | 1.12.2 | MIT | https://registry.npmjs.org/unrs-resolver/-/unrs-resolver-1.12.2.tgz | reuse |
| 463 | update-browserslist-db | 1.3.3 | MIT | https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.3.3.tgz | reuse |
| 464 | uri-js | 4.4.1 | BSD-2-Clause | https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz | reuse |
| 465 | which | 2.0.2 | ISC | https://registry.npmjs.org/which/-/which-2.0.2.tgz | unresolved |
| 466 | which-boxed-primitive | 1.1.1 | MIT | https://registry.npmjs.org/which-boxed-primitive/-/which-boxed-primitive-1.1.1.tgz | reuse |
| 467 | which-builtin-type | 1.2.1 | MIT | https://registry.npmjs.org/which-builtin-type/-/which-builtin-type-1.2.1.tgz | reuse |
| 468 | which-collection | 1.0.2 | MIT | https://registry.npmjs.org/which-collection/-/which-collection-1.0.2.tgz | reuse |
| 469 | which-typed-array | 1.1.23 | MIT | https://registry.npmjs.org/which-typed-array/-/which-typed-array-1.1.23.tgz | reuse |
| 470 | word-wrap | 1.2.5 | MIT | https://registry.npmjs.org/word-wrap/-/word-wrap-1.2.5.tgz | reuse |
| 471 | yallist | 3.1.1 | ISC | https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz | unresolved |
| 472 | yocto-queue | 0.1.0 | MIT | https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz | reuse |
| 473 | zod | 4.6.5 | MIT | https://registry.npmjs.org/zod/-/zod-4.6.5.tgz | reuse |
| 474 | zod-validation-error | 4.0.2 | MIT | https://registry.npmjs.org/zod-validation-error/-/zod-validation-error-4.0.2.tgz | reuse |

## Direct dependencies (root `package.json`)

- `next` 16.3.8 — dependency `sharp` ^0.35.4 (resolved 0.35.5)
- `parse5` 7.3.0
- `pdfjs-dist` 6.3.289
- `react` 19.3.0
- `react-dom` 19.3.0

Dev dependencies: `@axe-core/playwright`, `@playwright/test`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `gray-matter`, `playwright`, `tailwindcss`, `typescript`.

## Sharp / libvips (LGPL — unresolved, not cleared)

`sharp` 0.35.5 — declared licence Apache-2.0, optional dependency of `next`. Source: https://registry.npmjs.org/sharp/-/sharp-0.35.5.tgz. Funds libvips via opencollective.com/libvips.

Sharp's optional platform bindings (`@img/sharp-*`) carry declared licences per package — see rows 40-65 below. Their `sharp-libvips-*` optionalDependencies declare **LGPL-3.0-or-later** (libvips). Four conjunctive Sharp Windows/wasm bindings declare **Apache-2.0 AND LGPL-3.0-or-later** (`@img/sharp-win32-arm64`, `@img/sharp-win32-ia32`, `@img/sharp-win32-x64`) or **Apache-2.0 AND LGPL-3.0-or-later AND MIT** (`@img/sharp-wasm32`). SPDX AND means every conjunct applies, so these carry LGPL obligations too.

These copyleft components are present in the lockfile. Whether they are redistributed by this site's build output is **unresolved** and is recorded here for Andy or the solicitor, **not described as legally cleared**.

Sharp libvips platform packages (version 1.3.4, all optional, declared licence LGPL-3.0-or-later):
- `@img/sharp-libvips-darwin-arm64` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.3.4.tgz
- `@img/sharp-libvips-darwin-x64` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.3.4.tgz
- `@img/sharp-libvips-linux-arm` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.3.4.tgz
- `@img/sharp-libvips-linux-arm64` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.3.4.tgz
- `@img/sharp-libvips-linux-ppc64` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-linux-ppc64/-/sharp-libvips-linux-ppc64-1.3.4.tgz
- `@img/sharp-libvips-linux-riscv64` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-linux-riscv64/-/sharp-libvips-linux-riscv64-1.3.4.tgz
- `@img/sharp-libvips-linux-s390x` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.3.4.tgz
- `@img/sharp-libvips-linux-x64` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.3.4.tgz
- `@img/sharp-libvips-linuxmusl-arm64` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.3.4.tgz
- `@img/sharp-libvips-linuxmusl-x64` 1.3.4 — LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.3.4.tgz

Other Sharp packages carrying LGPL conjuncts:
- `@img/sharp-wasm32` 0.35.5 — Apache-2.0 AND LGPL-3.0-or-later AND MIT — https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.35.5.tgz
- `@img/sharp-win32-arm64` 0.35.5 — Apache-2.0 AND LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-win32-arm64/-/sharp-win32-arm64-0.35.5.tgz
- `@img/sharp-win32-ia32` 0.35.5 — Apache-2.0 AND LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.35.5.tgz
- `@img/sharp-win32-x64` 0.35.5 — Apache-2.0 AND LGPL-3.0-or-later — https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.35.5.tgz

libvips source: https://opencollective.com/libvips (funding page; not a licence grant).

## MPL-2.0 packages (unresolved interpretation)

14 packages declare MPL-2.0, including `lightningcss` and its platform packages plus `@axe-core/playwright` and `axe-core`. MPL-2.0 is not on the MIT/Apache/BSD reuse list and not on the GPL/AGPL/LGPL forbidden list. The interpretation is recorded as **unresolved** for Andy or the solicitor, not described as cleared.

- `@axe-core/playwright` 4.13.0 — MPL-2.0 — https://registry.npmjs.org/@axe-core/playwright/-/playwright-4.13.0.tgz
- `axe-core` 4.13.0 — MPL-2.0 — https://registry.npmjs.org/axe-core/-/axe-core-4.13.0.tgz
- `lightningcss` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz
- `lightningcss-android-arm64` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz
- `lightningcss-darwin-arm64` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz
- `lightningcss-darwin-x64` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz
- `lightningcss-freebsd-x64` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz
- `lightningcss-linux-arm-gnueabihf` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz
- `lightningcss-linux-arm64-gnu` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz
- `lightningcss-linux-arm64-musl` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz
- `lightningcss-linux-x64-gnu` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz
- `lightningcss-linux-x64-musl` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz
- `lightningcss-win32-arm64-msvc` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz
- `lightningcss-win32-x64-msvc` 1.32.0 — MPL-2.0 — https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz

## Shipped media evidence (public/media/home/SOURCES.md)

Source file preserved unchanged. Self-hosted under `public/media/home/`; static CSP `img-src 'self'` loads them. None are RelicVault assets; none are customer records. The luxury terrace still (`uk-terrace.webp`) was dropped after local review.

| File | Scene | Source | Stated terms |
| --- | --- | --- | --- |
| `office-phone.webp` | Person on a mobile at a desk | [Pexels 3760263](https://www.pexels.com/photo/3760263/) | Pexels License |
| `site-trade.webp` | Tradesperson at an electrical box | [Unsplash `_2AlIm-F6pw`](https://unsplash.com/photos/_2AlIm-F6pw) | Unsplash License |
| `uk-row.webp` | Pale gabled UK houses | [Max / Unsplash](https://unsplash.com/photos/83w1pQgZ5bs) | Unsplash License |

Encoded with ffmpeg/libwebp (local crops, no Unsplash/Pexels hotlink).

All referenced shipped files exist on disk; all three source entries resolve.

## Unresolved obligations

- ISC packages (18, including `semver`, `electron-to-chromium`, `eslint-import-resolver-typescript`, `glob-parent`, `fastq`, `flatted`, `graceful-fs`, `isexe`, `lru-cache`, `minimatch`, `picocolors`, `which`, `yallist`): reuse interpretation unresolved per estate licence route (MIT/Apache/BSD only).
- Sharp/libvips LGPL-3.0-or-later redistribution interpretation: not established. Recorded as unresolved; not described as legally cleared.
- `@img/sharp-wasm32`, `@img/sharp-win32-arm64`, `@img/sharp-win32-ia32`, `@img/sharp-win32-x64` declare conjunctive licences containing LGPL-3.0-or-later; redistribution interpretation unresolved.
- MPL-2.0 packages (14, including `lightningcss` platform packages and `@axe-core/playwright`): reuse interpretation unresolved.
- No copyleft/source-available/unlicensed obligation is presented as cleared in this record.

## What this record does not do

- Does not add a root licence (LICENSE / LICENSE.md / COPYING unchanged).
- Does not change dependencies, package.json, or package-lock.json.
- Does not download licence data or contact any service.
- Does not resolve legal ambiguity in code.
- Does not touch `src/**`, public media files, deploy/, .do/, .github/, Dockerfile, docker-compose*, .env*, nginx, startup, voice/telephony/product backend/production data.
