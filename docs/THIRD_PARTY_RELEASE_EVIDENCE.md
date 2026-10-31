# Third-party release evidence — maintenanceos-website

## Scope

This record captures deterministic exact-candidate evidence for third-party package and shipped-media licence obligations. It records evidence only; it makes no legal decision, adds no project licence, and does not change the site's proprietary contract-only licence.

Licence route: REUSE-WITH-ATTRIBUTION. MIT/Apache/BSD packages are recorded with their declared licence and source reference so notices and attribution requirements stay visible. LGPL components (Sharp/libvips) are recorded as unresolved — not described as legally cleared. MPL-2.0 and other non-reuse licences are recorded as unresolved interpretation for Andy or the solicitor.

## Candidate identity

- Source commit: `ff0140cc8ef7ac48e7fdab2c17d2f8ee4cbd4cbe` (2026-10-31)
- `package-lock.json` SHA-256: `b6b40384eb0034ae70ae32d6df5ab824d34a43641611e272e5f207b4af906d37`
- lockfileVersion: 3
- Root package: `maintenanceos-website` 0.1.0 (private)

## Package evidence (from package-lock.json, lockfileVersion 3)

474 package entries. Every entry carries a declared `license` field and a `resolved` source reference except nested packages under `@tailwindcss/oxide-wasm32-wasi` (no `resolved` field); those are recorded with name, version and licence only.

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
| 1 | node_modules/@alloc/quick-lru | 5.3.0 | MIT | https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.3.0.tgz | reuse |
| 2 | node_modules/@axe-core/playwright | 4.13.0 | MPL-2.0 | https://registry.npmjs.org/@axe-core/playwright/-/playwright-4.13.0.tgz | unresolved |
| 3 | node_modules/@babel/code-frame | 7.29.7 | MIT | https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz | reuse |
| 4 | node_modules/@babel/compat-data | 7.29.7 | MIT | https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz | reuse |
| 5 | node_modules/@babel/core | 7.29.7 | MIT | https://registry.npmjs.org/@babel/core/-/core-7.29.7.tgz | reuse |
| 6 | node_modules/@babel/core/node_modules/semver | 6.3.1 | ISC | https://registry.npmjs.org/semver/-/semver-6.3.1.tgz | unresolved |
| 7 | node_modules/@babel/generator | 7.29.8 | MIT | https://registry.npmjs.org/@babel/generator/-/generator-7.29.8.tgz | reuse |
| 8 | node_modules/@babel/helper-compilation-targets | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.7.tgz | reuse |
| 9 | node_modules/@babel/helper-compilation-targets/node_modules/semver | 6.3.1 | ISC | https://registry.npmjs.org/semver/-/semver-6.3.1.tgz | unresolved |
| 10 | node_modules/@babel/helper-globals | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz | reuse |
| 11 | node_modules/@babel/helper-module-imports | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz | reuse |
| 12 | node_modules/@babel/helper-module-transforms | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.7.tgz | reuse |
| 13 | node_modules/@babel/helper-string-parser | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.7.tgz | reuse |
| 14 | node_modules/@babel/helper-validator-identifier | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz | reuse |
| 15 | node_modules/@babel/helper-validator-option | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz | reuse |
| 16 | node_modules/@babel/helpers | 7.29.7 | MIT | https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.7.tgz | reuse |
| 17 | node_modules/@babel/parser | 7.29.9 | MIT | https://registry.npmjs.org/@babel/parser/-/parser-7.29.9.tgz | reuse |
| 18 | node_modules/@babel/template | 7.29.7 | MIT | https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz | reuse |
| 19 | node_modules/@babel/traverse | 7.29.8 | MIT | https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.8.tgz | reuse |
| 20 | node_modules/@babel/types | 7.29.8 | MIT | https://registry.npmjs.org/@babel/types/-/types-7.29.8.tgz | reuse |
| 21 | node_modules/@emnapi/core | 1.10.0 | MIT | https://registry.npmjs.org/@emnapi/core/-/core-1.10.0.tgz | reuse |
| 22 | node_modules/@emnapi/runtime | 1.11.3 | MIT | https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.11.3.tgz | reuse |
| 23 | node_modules/@emnapi/wasi-threads | 1.2.1 | MIT | https://registry.npmjs.org/@emnapi/wasi-threads/-/wasi-threads-1.2.1.tgz | reuse |
| 24 | node_modules/@eslint-community/eslint-utils | 4.10.1 | MIT | https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.10.1.tgz | reuse |
| 25 | node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys | 3.4.3 | Apache-2.0 | https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz | reuse |
| 26 | node_modules/@eslint-community/regexpp | 4.12.2 | MIT | https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.2.tgz | reuse |
| 27 | node_modules/@eslint/config-array | 0.21.2 | Apache-2.0 | https://registry.npmjs.org/@eslint/config-array/-/config-array-0.21.2.tgz | reuse |
| 28 | node_modules/@eslint/config-helpers | 0.4.2 | Apache-2.0 | https://registry.npmjs.org/@eslint/config-helpers/-/config-helpers-0.4.2.tgz | reuse |
| 29 | node_modules/@eslint/core | 0.17.0 | Apache-2.0 | https://registry.npmjs.org/@eslint/core/-/core-0.17.0.tgz | reuse |
| 30 | node_modules/@eslint/eslintrc | 3.3.7 | MIT | https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-3.3.7.tgz | reuse |
| 31 | node_modules/@eslint/js | 9.39.5 | MIT | https://registry.npmjs.org/@eslint/js/-/js-9.39.5.tgz | reuse |
| 32 | node_modules/@eslint/object-schema | 2.1.7 | Apache-2.0 | https://registry.npmjs.org/@eslint/object-schema/-/object-schema-2.1.7.tgz | reuse |
| 33 | node_modules/@eslint/plugin-kit | 0.4.1 | Apache-2.0 | https://registry.npmjs.org/@eslint/plugin-kit/-/plugin-kit-0.4.1.tgz | reuse |
| 34 | node_modules/@humanfs/core | 0.19.2 | Apache-2.0 | https://registry.npmjs.org/@humanfs/core/-/core-0.19.2.tgz | reuse |
| 35 | node_modules/@humanfs/node | 0.16.8 | Apache-2.0 | https://registry.npmjs.org/@humanfs/node/-/node-0.16.8.tgz | reuse |
| 36 | node_modules/@humanfs/types | 0.15.0 | Apache-2.0 | https://registry.npmjs.org/@humanfs/types/-/types-0.15.0.tgz | reuse |
| 37 | node_modules/@humanwhocodes/module-importer | 1.0.1 | Apache-2.0 | https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz | reuse |
| 38 | node_modules/@humanwhocodes/retry | 0.4.3 | Apache-2.0 | https://registry.npmjs.org/@humanwhocodes/retry/-/retry-0.4.3.tgz | reuse |
| 39 | node_modules/@img/colour | 1.1.0 | MIT | https://registry.npmjs.org/@img/colour/-/colour-1.1.0.tgz | reuse |
| 40 | node_modules/@img/sharp-darwin-arm64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-darwin-arm64/-/sharp-darwin-arm64-0.35.5.tgz | reuse |
| 41 | node_modules/@img/sharp-darwin-x64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-darwin-x64/-/sharp-darwin-x64-0.35.5.tgz | reuse |
| 42 | node_modules/@img/sharp-freebsd-wasm32 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-freebsd-wasm32/-/sharp-freebsd-wasm32-0.35.5.tgz | reuse |
| 43 | node_modules/@img/sharp-libvips-darwin-arm64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.3.4.tgz | copyleft/unlicensed |
| 44 | node_modules/@img/sharp-libvips-darwin-x64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.3.4.tgz | copyleft/unlicensed |
| 45 | node_modules/@img/sharp-libvips-linux-arm | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.3.4.tgz | copyleft/unlicensed |
| 46 | node_modules/@img/sharp-libvips-linux-arm64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.3.4.tgz | copyleft/unlicensed |
| 47 | node_modules/@img/sharp-libvips-linux-ppc64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-ppc64/-/sharp-libvips-linux-ppc64-1.3.4.tgz | copyleft/unlicensed |
| 48 | node_modules/@img/sharp-libvips-linux-riscv64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-riscv64/-/sharp-libvips-linux-riscv64-1.3.4.tgz | copyleft/unlicensed |
| 49 | node_modules/@img/sharp-libvips-linux-s390x | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.3.4.tgz | copyleft/unlicensed |
| 50 | node_modules/@img/sharp-libvips-linux-x64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.3.4.tgz | copyleft/unlicensed |
| 51 | node_modules/@img/sharp-libvips-linuxmusl-arm64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.3.4.tgz | copyleft/unlicensed |
| 52 | node_modules/@img/sharp-libvips-linuxmusl-x64 | 1.3.4 | LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.3.4.tgz | copyleft/unlicensed |
| 53 | node_modules/@img/sharp-linux-arm | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-arm/-/sharp-linux-arm-0.35.5.tgz | reuse |
| 54 | node_modules/@img/sharp-linux-arm64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-arm64/-/sharp-linux-arm64-0.35.5.tgz | reuse |
| 55 | node_modules/@img/sharp-linux-ppc64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-ppc64/-/sharp-linux-ppc64-0.35.5.tgz | reuse |
| 56 | node_modules/@img/sharp-linux-riscv64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-riscv64/-/sharp-linux-riscv64-0.35.5.tgz | reuse |
| 57 | node_modules/@img/sharp-linux-s390x | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-s390x/-/sharp-linux-s390x-0.35.5.tgz | reuse |
| 58 | node_modules/@img/sharp-linux-x64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-0.35.5.tgz | reuse |
| 59 | node_modules/@img/sharp-linuxmusl-arm64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linuxmusl-arm64/-/sharp-linuxmusl-arm64-0.35.5.tgz | reuse |
| 60 | node_modules/@img/sharp-linuxmusl-x64 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-linuxmusl-x64/-/sharp-linuxmusl-x64-0.35.5.tgz | reuse |
| 61 | node_modules/@img/sharp-wasm32 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later AND MIT | https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.35.5.tgz | copyleft/unlicensed |
| 62 | node_modules/@img/sharp-webcontainers-wasm32 | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/@img/sharp-webcontainers-wasm32/-/sharp-webcontainers-wasm32-0.35.5.tgz | reuse |
| 63 | node_modules/@img/sharp-win32-arm64 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-win32-arm64/-/sharp-win32-arm64-0.35.5.tgz | copyleft/unlicensed |
| 64 | node_modules/@img/sharp-win32-ia32 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.35.5.tgz | copyleft/unlicensed |
| 65 | node_modules/@img/sharp-win32-x64 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.35.5.tgz | copyleft/unlicensed |
| 66 | node_modules/@jridgewell/gen-mapping | 0.3.13 | MIT | https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz | reuse |
| 67 | node_modules/@jridgewell/remapping | 2.3.5 | MIT | https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz | reuse |
| 68 | node_modules/@jridgewell/resolve-uri | 3.1.2 | MIT | https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz | reuse |
| 69 | node_modules/@jridgewell/sourcemap-codec | 1.6.0 | MIT | https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz | reuse |
| 70 | node_modules/@jridgewell/trace-mapping | 0.3.31 | MIT | https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz | reuse |
| 71 | node_modules/@napi-rs/canvas | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas/-/canvas-1.0.10.tgz | reuse |
| 72 | node_modules/@napi-rs/canvas-android-arm64 | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-android-arm64/-/canvas-android-arm64-1.0.10.tgz | reuse |
| 73 | node_modules/@napi-rs/canvas-darwin-arm64 | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-darwin-arm64/-/canvas-darwin-arm64-1.0.10.tgz | reuse |
| 74 | node_modules/@napi-rs/canvas-darwin-x64 | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-darwin-x64/-/canvas-darwin-x64-1.0.10.tgz | reuse |
| 75 | node_modules/@napi-rs/canvas-linux-arm-gnueabihf | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-arm-gnueabihf/-/canvas-linux-arm-gnueabihf-1.0.10.tgz | reuse |
| 76 | node_modules/@napi-rs/canvas-linux-arm64-gnu | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-arm64-gnu/-/canvas-linux-arm64-gnu-1.0.10.tgz | reuse |
| 77 | node_modules/@napi-rs/canvas-linux-arm64-musl | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-arm64-musl/-/canvas-linux-arm64-musl-1.0.10.tgz | reuse |
| 78 | node_modules/@napi-rs/canvas-linux-riscv64-gnu | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-riscv64-gnu/-/canvas-linux-riscv64-gnu-1.0.10.tgz | reuse |
| 79 | node_modules/@napi-rs/canvas-linux-x64-gnu | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-x64-gnu/-/canvas-linux-x64-gnu-1.0.10.tgz | reuse |
| 80 | node_modules/@napi-rs/canvas-linux-x64-musl | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-linux-x64-musl/-/canvas-linux-x64-musl-1.0.10.tgz | reuse |
| 81 | node_modules/@napi-rs/canvas-win32-arm64-msvc | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-win32-arm64-msvc/-/canvas-win32-arm64-msvc-1.0.10.tgz | reuse |
| 82 | node_modules/@napi-rs/canvas-win32-x64-msvc | 1.0.10 | MIT | https://registry.npmjs.org/@napi-rs/canvas-win32-x64-msvc/-/canvas-win32-x64-msvc-1.0.10.tgz | reuse |
| 83 | node_modules/@napi-rs/wasm-runtime | 1.2.4 | MIT | https://registry.npmjs.org/@napi-rs/wasm-runtime/-/wasm-runtime-1.2.4.tgz | reuse |
| 84 | node_modules/@next/env | 16.4.3 | MIT | https://registry.npmjs.org/@next/env/-/env-16.4.3.tgz | reuse |
| 85 | node_modules/@next/eslint-plugin-next | 16.4.3 | MIT | https://registry.npmjs.org/@next/eslint-plugin-next/-/eslint-plugin-next-16.4.3.tgz | reuse |
| 86 | node_modules/@next/eslint-plugin-next/node_modules/@eslint-community/eslint-utils | 4.9.1 | MIT | https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.9.1.tgz | reuse |
| 87 | node_modules/@next/eslint-plugin-next/node_modules/eslint-visitor-keys | 3.4.3 | Apache-2.0 | https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz | reuse |
| 88 | node_modules/@next/swc-darwin-arm64 | 16.4.3 | MIT | https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-16.4.3.tgz | reuse |
| 89 | node_modules/@next/swc-darwin-x64 | 16.4.3 | MIT | https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-16.4.3.tgz | reuse |
| 90 | node_modules/@next/swc-linux-arm64-gnu | 16.4.3 | MIT | https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-16.4.3.tgz | reuse |
| 91 | node_modules/@next/swc-linux-arm64-musl | 16.4.3 | MIT | https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-16.4.3.tgz | reuse |
| 92 | node_modules/@next/swc-linux-x64-gnu | 16.4.3 | MIT | https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-16.4.3.tgz | reuse |
| 93 | node_modules/@next/swc-linux-x64-musl | 16.4.3 | MIT | https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-16.4.3.tgz | reuse |
| 94 | node_modules/@next/swc-win32-arm64-msvc | 16.4.3 | MIT | https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-16.4.3.tgz | reuse |
| 95 | node_modules/@next/swc-win32-x64-msvc | 16.4.3 | MIT | https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-16.4.3.tgz | reuse |
| 96 | node_modules/@nodelib/fs.scandir | 2.1.5 | MIT | https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz | reuse |
| 97 | node_modules/@nodelib/fs.stat | 2.0.5 | MIT | https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz | reuse |
| 98 | node_modules/@nodelib/fs.walk | 1.2.8 | MIT | https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz | reuse |
| 99 | node_modules/@nolyfill/is-core-module | 1.0.39 | MIT | https://registry.npmjs.org/@nolyfill/is-core-module/-/is-core-module-1.0.39.tgz | reuse |
| 100 | node_modules/@playwright/test | 1.63.0 | Apache-2.0 | https://registry.npmjs.org/@playwright/test/-/test-1.63.0.tgz | reuse |
| 101 | node_modules/@rtsao/scc | 1.1.0 | MIT | https://registry.npmjs.org/@rtsao/scc/-/scc-1.1.0.tgz | reuse |
| 102 | node_modules/@swc/helpers | 0.5.23 | Apache-2.0 | https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.23.tgz | reuse |
| 103 | node_modules/@tailwindcss/node | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/node/-/node-4.3.3.tgz | reuse |
| 104 | node_modules/@tailwindcss/oxide | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide/-/oxide-4.3.3.tgz | reuse |
| 105 | node_modules/@tailwindcss/oxide-android-arm64 | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-android-arm64/-/oxide-android-arm64-4.3.3.tgz | reuse |
| 106 | node_modules/@tailwindcss/oxide-darwin-arm64 | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-darwin-arm64/-/oxide-darwin-arm64-4.3.3.tgz | reuse |
| 107 | node_modules/@tailwindcss/oxide-darwin-x64 | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-darwin-x64/-/oxide-darwin-x64-4.3.3.tgz | reuse |
| 108 | node_modules/@tailwindcss/oxide-freebsd-x64 | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-freebsd-x64/-/oxide-freebsd-x64-4.3.3.tgz | reuse |
| 109 | node_modules/@tailwindcss/oxide-linux-arm-gnueabihf | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-arm-gnueabihf/-/oxide-linux-arm-gnueabihf-4.3.3.tgz | reuse |
| 110 | node_modules/@tailwindcss/oxide-linux-arm64-gnu | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-gnu/-/oxide-linux-arm64-gnu-4.3.3.tgz | reuse |
| 111 | node_modules/@tailwindcss/oxide-linux-arm64-musl | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-musl/-/oxide-linux-arm64-musl-4.3.3.tgz | reuse |
| 112 | node_modules/@tailwindcss/oxide-linux-x64-gnu | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-gnu/-/oxide-linux-x64-gnu-4.3.3.tgz | reuse |
| 113 | node_modules/@tailwindcss/oxide-linux-x64-musl | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-musl/-/oxide-linux-x64-musl-4.3.3.tgz | reuse |
| 114 | node_modules/@tailwindcss/oxide-wasm32-wasi | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.3.3.tgz | reuse |
| 115 | node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/core | 1.11.1 | MIT | (nested; no resolved field) | reuse |
| 116 | node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/runtime | 1.11.1 | MIT | (nested; no resolved field) | reuse |
| 117 | node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/wasi-threads | 1.2.2 | MIT | (nested; no resolved field) | reuse |
| 118 | node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@napi-rs/wasm-runtime | 1.1.4 | MIT | (nested; no resolved field) | reuse |
| 119 | node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@tybys/wasm-util | 0.10.2 | MIT | (nested; no resolved field) | reuse |
| 120 | node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/tslib | 2.8.1 | 0BSD | (nested; no resolved field) | reuse |
| 121 | node_modules/@tailwindcss/oxide-win32-arm64-msvc | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-win32-arm64-msvc/-/oxide-win32-arm64-msvc-4.3.3.tgz | reuse |
| 122 | node_modules/@tailwindcss/oxide-win32-x64-msvc | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-4.3.3.tgz | reuse |
| 123 | node_modules/@tailwindcss/postcss | 4.3.3 | MIT | https://registry.npmjs.org/@tailwindcss/postcss/-/postcss-4.3.3.tgz | reuse |
| 124 | node_modules/@tybys/wasm-util | 0.10.4 | MIT | https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.4.tgz | reuse |
| 125 | node_modules/@types/estree | 1.0.9 | MIT | https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz | reuse |
| 126 | node_modules/@types/json-schema | 7.0.15 | MIT | https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz | reuse |
| 127 | node_modules/@types/json5 | 0.0.29 | MIT | https://registry.npmjs.org/@types/json5/-/json5-0.0.29.tgz | reuse |
| 128 | node_modules/@types/node | 24.19.0 | MIT | https://registry.npmjs.org/@types/node/-/node-24.19.0.tgz | reuse |
| 129 | node_modules/@types/react | 19.3.0 | MIT | https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz | reuse |
| 130 | node_modules/@types/react-dom | 19.3.0 | MIT | https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz | reuse |
| 131 | node_modules/@typescript-eslint/eslint-plugin | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/eslint-plugin/-/eslint-plugin-8.70.1.tgz | reuse |
| 132 | node_modules/@typescript-eslint/eslint-plugin/node_modules/ignore | 7.0.10 | MIT | https://registry.npmjs.org/ignore/-/ignore-7.0.10.tgz | reuse |
| 133 | node_modules/@typescript-eslint/parser | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/parser/-/parser-8.70.1.tgz | reuse |
| 134 | node_modules/@typescript-eslint/project-service | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/project-service/-/project-service-8.70.1.tgz | reuse |
| 135 | node_modules/@typescript-eslint/scope-manager | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/scope-manager/-/scope-manager-8.70.1.tgz | reuse |
| 136 | node_modules/@typescript-eslint/tsconfig-utils | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/tsconfig-utils/-/tsconfig-utils-8.70.1.tgz | reuse |
| 137 | node_modules/@typescript-eslint/type-utils | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/type-utils/-/type-utils-8.70.1.tgz | reuse |
| 138 | node_modules/@typescript-eslint/types | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/types/-/types-8.70.1.tgz | reuse |
| 139 | node_modules/@typescript-eslint/typescript-estree | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/typescript-estree/-/typescript-estree-8.70.1.tgz | reuse |
| 140 | node_modules/@typescript-eslint/typescript-estree/node_modules/balanced-match | 4.0.4 | MIT | https://registry.npmjs.org/balanced-match/-/balanced-match-4.0.4.tgz | reuse |
| 141 | node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion | 5.0.12 | MIT | https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.12.tgz | reuse |
| 142 | node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch | 10.2.6 | BlueOak-1.0.0 | https://registry.npmjs.org/minimatch/-/minimatch-10.2.6.tgz | unresolved |
| 143 | node_modules/@typescript-eslint/utils | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/utils/-/utils-8.70.1.tgz | reuse |
| 144 | node_modules/@typescript-eslint/visitor-keys | 8.70.1 | MIT | https://registry.npmjs.org/@typescript-eslint/visitor-keys/-/visitor-keys-8.70.1.tgz | reuse |
| 145 | node_modules/@typescript-eslint/visitor-keys/node_modules/eslint-visitor-keys | 5.0.1 | Apache-2.0 | https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-5.0.1.tgz | reuse |
| 146 | node_modules/@unrs/resolver-binding-android-arm-eabi | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-android-arm-eabi/-/resolver-binding-android-arm-eabi-1.12.2.tgz | reuse |
| 147 | node_modules/@unrs/resolver-binding-android-arm64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-android-arm64/-/resolver-binding-android-arm64-1.12.2.tgz | reuse |
| 148 | node_modules/@unrs/resolver-binding-darwin-arm64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-darwin-arm64/-/resolver-binding-darwin-arm64-1.12.2.tgz | reuse |
| 149 | node_modules/@unrs/resolver-binding-darwin-x64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-darwin-x64/-/resolver-binding-darwin-x64-1.12.2.tgz | reuse |
| 150 | node_modules/@unrs/resolver-binding-freebsd-x64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-freebsd-x64/-/resolver-binding-freebsd-x64-1.12.2.tgz | reuse |
| 151 | node_modules/@unrs/resolver-binding-linux-arm-gnueabihf | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-gnueabihf/-/resolver-binding-linux-arm-gnueabihf-1.12.2.tgz | reuse |
| 152 | node_modules/@unrs/resolver-binding-linux-arm-musleabihf | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-musleabihf/-/resolver-binding-linux-arm-musleabihf-1.12.2.tgz | reuse |
| 153 | node_modules/@unrs/resolver-binding-linux-arm64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-gnu/-/resolver-binding-linux-arm64-gnu-1.12.2.tgz | reuse |
| 154 | node_modules/@unrs/resolver-binding-linux-arm64-musl | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-musl/-/resolver-binding-linux-arm64-musl-1.12.2.tgz | reuse |
| 155 | node_modules/@unrs/resolver-binding-linux-loong64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-loong64-gnu/-/resolver-binding-linux-loong64-gnu-1.12.2.tgz | reuse |
| 156 | node_modules/@unrs/resolver-binding-linux-loong64-musl | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-loong64-musl/-/resolver-binding-linux-loong64-musl-1.12.2.tgz | reuse |
| 157 | node_modules/@unrs/resolver-binding-linux-ppc64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-ppc64-gnu/-/resolver-binding-linux-ppc64-gnu-1.12.2.tgz | reuse |
| 158 | node_modules/@unrs/resolver-binding-linux-riscv64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-gnu/-/resolver-binding-linux-riscv64-gnu-1.12.2.tgz | reuse |
| 159 | node_modules/@unrs/resolver-binding-linux-riscv64-musl | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-musl/-/resolver-binding-linux-riscv64-musl-1.12.2.tgz | reuse |
| 160 | node_modules/@unrs/resolver-binding-linux-s390x-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-s390x-gnu/-/resolver-binding-linux-s390x-gnu-1.12.2.tgz | reuse |
| 161 | node_modules/@unrs/resolver-binding-linux-x64-gnu | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-gnu/-/resolver-binding-linux-x64-gnu-1.12.2.tgz | reuse |
| 162 | node_modules/@unrs/resolver-binding-linux-x64-musl | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-musl/-/resolver-binding-linux-x64-musl-1.12.2.tgz | reuse |
| 163 | node_modules/@unrs/resolver-binding-openharmony-arm64 | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-openharmony-arm64/-/resolver-binding-openharmony-arm64-1.12.2.tgz | reuse |
| 164 | node_modules/@unrs/resolver-binding-wasm32-wasi | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-wasm32-wasi/-/resolver-binding-wasm32-wasi-1.12.2.tgz | reuse |
| 165 | node_modules/@unrs/resolver-binding-wasm32-wasi/node_modules/@emnapi/runtime | 1.10.0 | MIT | https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.10.0.tgz | reuse |
| 166 | node_modules/@unrs/resolver-binding-win32-arm64-msvc | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-win32-arm64-msvc/-/resolver-binding-win32-arm64-msvc-1.12.2.tgz | reuse |
| 167 | node_modules/@unrs/resolver-binding-win32-ia32-msvc | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-win32-ia32-msvc/-/resolver-binding-win32-ia32-msvc-1.12.2.tgz | reuse |
| 168 | node_modules/@unrs/resolver-binding-win32-x64-msvc | 1.12.2 | MIT | https://registry.npmjs.org/@unrs/resolver-binding-win32-x64-msvc/-/resolver-binding-win32-x64-msvc-1.12.2.tgz | reuse |
| 169 | node_modules/acorn | 8.18.0 | MIT | https://registry.npmjs.org/acorn/-/acorn-8.18.0.tgz | reuse |
| 170 | node_modules/acorn-jsx | 5.3.2 | MIT | https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz | reuse |
| 171 | node_modules/ajv | 6.15.0 | MIT | https://registry.npmjs.org/ajv/-/ajv-6.15.0.tgz | reuse |
| 172 | node_modules/ansi-styles | 4.3.0 | MIT | https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz | reuse |
| 173 | node_modules/argparse | 2.0.1 | Python-2.0 | https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz | unresolved |
| 174 | node_modules/aria-query | 5.3.2 | Apache-2.0 | https://registry.npmjs.org/aria-query/-/aria-query-5.3.2.tgz | reuse |
| 175 | node_modules/array-buffer-byte-length | 1.0.2 | MIT | https://registry.npmjs.org/array-buffer-byte-length/-/array-buffer-byte-length-1.0.2.tgz | reuse |
| 176 | node_modules/array-includes | 3.2.0 | MIT | https://registry.npmjs.org/array-includes/-/array-includes-3.2.0.tgz | reuse |
| 177 | node_modules/array.prototype.findlast | 1.2.5 | MIT | https://registry.npmjs.org/array.prototype.findlast/-/array.prototype.findlast-1.2.5.tgz | reuse |
| 178 | node_modules/array.prototype.findlastindex | 1.2.6 | MIT | https://registry.npmjs.org/array.prototype.findlastindex/-/array.prototype.findlastindex-1.2.6.tgz | reuse |
| 179 | node_modules/array.prototype.flat | 1.3.3 | MIT | https://registry.npmjs.org/array.prototype.flat/-/array.prototype.flat-1.3.3.tgz | reuse |
| 180 | node_modules/array.prototype.flatmap | 1.3.3 | MIT | https://registry.npmjs.org/array.prototype.flatmap/-/array.prototype.flatmap-1.3.3.tgz | reuse |
| 181 | node_modules/array.prototype.tosorted | 1.1.4 | MIT | https://registry.npmjs.org/array.prototype.tosorted/-/array.prototype.tosorted-1.1.4.tgz | reuse |
| 182 | node_modules/arraybuffer.prototype.slice | 1.0.4 | MIT | https://registry.npmjs.org/arraybuffer.prototype.slice/-/arraybuffer.prototype.slice-1.0.4.tgz | reuse |
| 183 | node_modules/ast-types-flow | 0.0.8 | MIT | https://registry.npmjs.org/ast-types-flow/-/ast-types-flow-0.0.8.tgz | reuse |
| 184 | node_modules/async-function | 1.0.0 | MIT | https://registry.npmjs.org/async-function/-/async-function-1.0.0.tgz | reuse |
| 185 | node_modules/available-typed-arrays | 1.0.7 | MIT | https://registry.npmjs.org/available-typed-arrays/-/available-typed-arrays-1.0.7.tgz | reuse |
| 186 | node_modules/axe-core | 4.13.0 | MPL-2.0 | https://registry.npmjs.org/axe-core/-/axe-core-4.13.0.tgz | unresolved |
| 187 | node_modules/axobject-query | 4.1.0 | Apache-2.0 | https://registry.npmjs.org/axobject-query/-/axobject-query-4.1.0.tgz | reuse |
| 188 | node_modules/balanced-match | 1.0.2 | MIT | https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz | reuse |
| 189 | node_modules/baseline-browser-mapping | 2.11.26 | Apache-2.0 | https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.26.tgz | reuse |
| 190 | node_modules/brace-expansion | 1.1.21 | MIT | https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.21.tgz | reuse |
| 191 | node_modules/braces | 3.0.3 | MIT | https://registry.npmjs.org/braces/-/braces-3.0.3.tgz | reuse |
| 192 | node_modules/browserslist | 4.29.1 | MIT | https://registry.npmjs.org/browserslist/-/browserslist-4.29.1.tgz | reuse |
| 193 | node_modules/call-bind | 1.0.9 | MIT | https://registry.npmjs.org/call-bind/-/call-bind-1.0.9.tgz | reuse |
| 194 | node_modules/call-bind-apply-helpers | 1.0.2 | MIT | https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz | reuse |
| 195 | node_modules/call-bound | 1.0.4 | MIT | https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz | reuse |
| 196 | node_modules/callsites | 3.1.0 | MIT | https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz | reuse |
| 197 | node_modules/caniuse-lite | 1.0.30001810 | CC-BY-4.0 | https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001810.tgz | unresolved |
| 198 | node_modules/chalk | 4.1.2 | MIT | https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz | reuse |
| 199 | node_modules/client-only | 0.0.1 | MIT | https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz | reuse |
| 200 | node_modules/color-convert | 2.0.1 | MIT | https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz | reuse |
| 201 | node_modules/color-name | 1.1.4 | MIT | https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz | reuse |
| 202 | node_modules/concat-map | 0.0.1 | MIT | https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz | reuse |
| 203 | node_modules/convert-source-map | 2.0.0 | MIT | https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz | reuse |
| 204 | node_modules/cross-spawn | 7.0.6 | MIT | https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz | reuse |
| 205 | node_modules/csstype | 3.2.3 | MIT | https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz | reuse |
| 206 | node_modules/damerau-levenshtein | 1.0.8 | BSD-2-Clause | https://registry.npmjs.org/damerau-levenshtein/-/damerau-levenshtein-1.0.8.tgz | reuse |
| 207 | node_modules/data-view-buffer | 1.0.2 | MIT | https://registry.npmjs.org/data-view-buffer/-/data-view-buffer-1.0.2.tgz | reuse |
| 208 | node_modules/data-view-byte-length | 1.0.2 | MIT | https://registry.npmjs.org/data-view-byte-length/-/data-view-byte-length-1.0.2.tgz | reuse |
| 209 | node_modules/data-view-byte-offset | 1.0.1 | MIT | https://registry.npmjs.org/data-view-byte-offset/-/data-view-byte-offset-1.0.1.tgz | reuse |
| 210 | node_modules/debug | 4.4.3 | MIT | https://registry.npmjs.org/debug/-/debug-4.4.3.tgz | reuse |
| 211 | node_modules/deep-is | 0.1.4 | MIT | https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz | reuse |
| 212 | node_modules/define-data-property | 1.1.4 | MIT | https://registry.npmjs.org/define-data-property/-/define-data-property-1.1.4.tgz | reuse |
| 213 | node_modules/define-properties | 1.2.1 | MIT | https://registry.npmjs.org/define-properties/-/define-properties-1.2.1.tgz | reuse |
| 214 | node_modules/detect-libc | 2.1.2 | Apache-2.0 | https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz | reuse |
| 215 | node_modules/doctrine | 2.1.0 | Apache-2.0 | https://registry.npmjs.org/doctrine/-/doctrine-2.1.0.tgz | reuse |
| 216 | node_modules/dunder-proto | 1.0.1 | MIT | https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz | reuse |
| 217 | node_modules/electron-to-chromium | 1.5.439 | ISC | https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.439.tgz | unresolved |
| 218 | node_modules/emoji-regex | 9.2.2 | MIT | https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz | reuse |
| 219 | node_modules/enhanced-resolve | 5.25.1 | MIT | https://registry.npmjs.org/enhanced-resolve/-/enhanced-resolve-5.25.1.tgz | reuse |
| 220 | node_modules/entities | 6.0.1 | BSD-2-Clause | https://registry.npmjs.org/entities/-/entities-6.0.1.tgz | reuse |
| 221 | node_modules/es-abstract | 1.24.2 | MIT | https://registry.npmjs.org/es-abstract/-/es-abstract-1.24.2.tgz | reuse |
| 222 | node_modules/es-abstract-get | 1.0.0 | MIT | https://registry.npmjs.org/es-abstract-get/-/es-abstract-get-1.0.0.tgz | reuse |
| 223 | node_modules/es-define-property | 1.0.1 | MIT | https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz | reuse |
| 224 | node_modules/es-errors | 1.3.0 | MIT | https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz | reuse |
| 225 | node_modules/es-iterator-helpers | 1.4.0 | MIT | https://registry.npmjs.org/es-iterator-helpers/-/es-iterator-helpers-1.4.0.tgz | reuse |
| 226 | node_modules/es-object-atoms | 1.1.2 | MIT | https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz | reuse |
| 227 | node_modules/es-set-tostringtag | 2.1.0 | MIT | https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz | reuse |
| 228 | node_modules/es-shim-unscopables | 1.1.0 | MIT | https://registry.npmjs.org/es-shim-unscopables/-/es-shim-unscopables-1.1.0.tgz | reuse |
| 229 | node_modules/es-to-primitive | 1.3.4 | MIT | https://registry.npmjs.org/es-to-primitive/-/es-to-primitive-1.3.4.tgz | reuse |
| 230 | node_modules/escalade | 3.2.0 | MIT | https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz | reuse |
| 231 | node_modules/escape-string-regexp | 4.0.0 | MIT | https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz | reuse |
| 232 | node_modules/eslint | 9.39.5 | MIT | https://registry.npmjs.org/eslint/-/eslint-9.39.5.tgz | reuse |
| 233 | node_modules/eslint-config-next | 16.4.3 | MIT | https://registry.npmjs.org/eslint-config-next/-/eslint-config-next-16.4.3.tgz | reuse |
| 234 | node_modules/eslint-config-next/node_modules/eslint-import-resolver-typescript | 3.10.1 | ISC | https://registry.npmjs.org/eslint-import-resolver-typescript/-/eslint-import-resolver-typescript-3.10.1.tgz | unresolved |
| 235 | node_modules/eslint-config-next/node_modules/eslint-plugin-import | 2.32.0 | MIT | https://registry.npmjs.org/eslint-plugin-import/-/eslint-plugin-import-2.32.0.tgz | reuse |
| 236 | node_modules/eslint-config-next/node_modules/eslint-plugin-import/node_modules/debug | 3.2.7 | MIT | https://registry.npmjs.org/debug/-/debug-3.2.7.tgz | reuse |
| 237 | node_modules/eslint-config-next/node_modules/eslint-plugin-jsx-a11y | 6.10.2 | MIT | https://registry.npmjs.org/eslint-plugin-jsx-a11y/-/eslint-plugin-jsx-a11y-6.10.2.tgz | reuse |
| 238 | node_modules/eslint-config-next/node_modules/eslint-plugin-react | 7.37.5 | MIT | https://registry.npmjs.org/eslint-plugin-react/-/eslint-plugin-react-7.37.5.tgz | reuse |
| 239 | node_modules/eslint-config-next/node_modules/globals | 16.4.0 | MIT | https://registry.npmjs.org/globals/-/globals-16.4.0.tgz | reuse |
| 240 | node_modules/eslint-config-next/node_modules/semver | 6.3.1 | ISC | https://registry.npmjs.org/semver/-/semver-6.3.1.tgz | unresolved |
| 241 | node_modules/eslint-import-resolver-node | 0.3.10 | MIT | https://registry.npmjs.org/eslint-import-resolver-node/-/eslint-import-resolver-node-0.3.10.tgz | reuse |
| 242 | node_modules/eslint-import-resolver-node/node_modules/debug | 3.2.7 | MIT | https://registry.npmjs.org/debug/-/debug-3.2.7.tgz | reuse |
| 243 | node_modules/eslint-module-utils | 2.14.0 | MIT | https://registry.npmjs.org/eslint-module-utils/-/eslint-module-utils-2.14.0.tgz | reuse |
| 244 | node_modules/eslint-module-utils/node_modules/debug | 3.2.7 | MIT | https://registry.npmjs.org/debug/-/debug-3.2.7.tgz | reuse |
| 245 | node_modules/eslint-plugin-react-hooks | 7.1.1 | MIT | https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-7.1.1.tgz | reuse |
| 246 | node_modules/eslint-scope | 8.4.0 | BSD-2-Clause | https://registry.npmjs.org/eslint-scope/-/eslint-scope-8.4.0.tgz | reuse |
| 247 | node_modules/eslint-visitor-keys | 4.2.1 | Apache-2.0 | https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-4.2.1.tgz | reuse |
| 248 | node_modules/espree | 10.4.0 | BSD-2-Clause | https://registry.npmjs.org/espree/-/espree-10.4.0.tgz | reuse |
| 249 | node_modules/esprima | 4.0.1 | BSD-2-Clause | https://registry.npmjs.org/esprima/-/esprima-4.0.1.tgz | reuse |
| 250 | node_modules/esquery | 1.7.0 | BSD-3-Clause | https://registry.npmjs.org/esquery/-/esquery-1.7.0.tgz | reuse |
| 251 | node_modules/esrecurse | 4.3.0 | BSD-2-Clause | https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz | reuse |
| 252 | node_modules/estraverse | 5.3.0 | BSD-2-Clause | https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz | reuse |
| 253 | node_modules/esutils | 2.0.3 | BSD-2-Clause | https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz | reuse |
| 254 | node_modules/extend-shallow | 2.0.1 | MIT | https://registry.npmjs.org/extend-shallow/-/extend-shallow-2.0.1.tgz | reuse |
| 255 | node_modules/fast-deep-equal | 3.1.3 | MIT | https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz | reuse |
| 256 | node_modules/fast-glob | 3.3.1 | MIT | https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.1.tgz | reuse |
| 257 | node_modules/fast-glob/node_modules/glob-parent | 5.1.2 | ISC | https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz | unresolved |
| 258 | node_modules/fast-json-stable-stringify | 2.1.0 | MIT | https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz | reuse |
| 259 | node_modules/fast-levenshtein | 2.0.6 | MIT | https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz | reuse |
| 260 | node_modules/fastq | 1.20.3 | ISC | https://registry.npmjs.org/fastq/-/fastq-1.20.3.tgz | unresolved |
| 261 | node_modules/file-entry-cache | 8.0.0 | MIT | https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-8.0.0.tgz | reuse |
| 262 | node_modules/fill-range | 7.1.1 | MIT | https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz | reuse |
| 263 | node_modules/find-up | 5.0.0 | MIT | https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz | reuse |
| 264 | node_modules/flat-cache | 4.0.1 | MIT | https://registry.npmjs.org/flat-cache/-/flat-cache-4.0.1.tgz | reuse |
| 265 | node_modules/flatted | 3.4.4 | ISC | https://registry.npmjs.org/flatted/-/flatted-3.4.4.tgz | unresolved |
| 266 | node_modules/for-each | 0.3.5 | MIT | https://registry.npmjs.org/for-each/-/for-each-0.3.5.tgz | reuse |
| 267 | node_modules/function-bind | 1.1.2 | MIT | https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz | reuse |
| 268 | node_modules/function.prototype.name | 1.2.0 | MIT | https://registry.npmjs.org/function.prototype.name/-/function.prototype.name-1.2.0.tgz | reuse |
| 269 | node_modules/functions-have-names | 1.2.3 | MIT | https://registry.npmjs.org/functions-have-names/-/functions-have-names-1.2.3.tgz | reuse |
| 270 | node_modules/generator-function | 2.0.1 | MIT | https://registry.npmjs.org/generator-function/-/generator-function-2.0.1.tgz | reuse |
| 271 | node_modules/gensync | 1.0.0-beta.2 | MIT | https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz | reuse |
| 272 | node_modules/get-intrinsic | 1.3.0 | MIT | https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz | reuse |
| 273 | node_modules/get-proto | 1.0.1 | MIT | https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz | reuse |
| 274 | node_modules/get-symbol-description | 1.1.0 | MIT | https://registry.npmjs.org/get-symbol-description/-/get-symbol-description-1.1.0.tgz | reuse |
| 275 | node_modules/get-tsconfig | 4.14.3 | MIT | https://registry.npmjs.org/get-tsconfig/-/get-tsconfig-4.14.3.tgz | reuse |
| 276 | node_modules/glob-parent | 6.0.2 | ISC | https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz | unresolved |
| 277 | node_modules/globals | 14.0.0 | MIT | https://registry.npmjs.org/globals/-/globals-14.0.0.tgz | reuse |
| 278 | node_modules/globalthis | 1.0.4 | MIT | https://registry.npmjs.org/globalthis/-/globalthis-1.0.4.tgz | reuse |
| 279 | node_modules/gopd | 1.2.0 | MIT | https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz | reuse |
| 280 | node_modules/graceful-fs | 4.2.11 | ISC | https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz | unresolved |
| 281 | node_modules/gray-matter | 4.0.3 | MIT | https://registry.npmjs.org/gray-matter/-/gray-matter-4.0.3.tgz | reuse |
| 282 | node_modules/gray-matter/node_modules/argparse | 1.0.10 | MIT | https://registry.npmjs.org/argparse/-/argparse-1.0.10.tgz | reuse |
| 283 | node_modules/gray-matter/node_modules/js-yaml | 3.15.2 | MIT | https://registry.npmjs.org/js-yaml/-/js-yaml-3.15.2.tgz | reuse |
| 284 | node_modules/has-bigints | 1.1.0 | MIT | https://registry.npmjs.org/has-bigints/-/has-bigints-1.1.0.tgz | reuse |
| 285 | node_modules/has-flag | 4.0.0 | MIT | https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz | reuse |
| 286 | node_modules/has-property-descriptors | 1.0.2 | MIT | https://registry.npmjs.org/has-property-descriptors/-/has-property-descriptors-1.0.2.tgz | reuse |
| 287 | node_modules/has-proto | 1.2.0 | MIT | https://registry.npmjs.org/has-proto/-/has-proto-1.2.0.tgz | reuse |
| 288 | node_modules/has-symbols | 1.1.0 | MIT | https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz | reuse |
| 289 | node_modules/has-tostringtag | 1.0.2 | MIT | https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz | reuse |
| 290 | node_modules/hasown | 2.0.4 | MIT | https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz | reuse |
| 291 | node_modules/hermes-estree | 0.25.1 | MIT | https://registry.npmjs.org/hermes-estree/-/hermes-estree-0.25.1.tgz | reuse |
| 292 | node_modules/hermes-parser | 0.25.1 | MIT | https://registry.npmjs.org/hermes-parser/-/hermes-parser-0.25.1.tgz | reuse |
| 293 | node_modules/ignore | 5.3.2 | MIT | https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz | reuse |
| 294 | node_modules/import-fresh | 3.3.1 | MIT | https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz | reuse |
| 295 | node_modules/imurmurhash | 0.1.4 | MIT | https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz | reuse |
| 296 | node_modules/internal-slot | 1.1.0 | MIT | https://registry.npmjs.org/internal-slot/-/internal-slot-1.1.0.tgz | reuse |
| 297 | node_modules/is-array-buffer | 3.0.5 | MIT | https://registry.npmjs.org/is-array-buffer/-/is-array-buffer-3.0.5.tgz | reuse |
| 298 | node_modules/is-async-function | 2.1.1 | MIT | https://registry.npmjs.org/is-async-function/-/is-async-function-2.1.1.tgz | reuse |
| 299 | node_modules/is-bigint | 1.1.0 | MIT | https://registry.npmjs.org/is-bigint/-/is-bigint-1.1.0.tgz | reuse |
| 300 | node_modules/is-boolean-object | 1.2.2 | MIT | https://registry.npmjs.org/is-boolean-object/-/is-boolean-object-1.2.2.tgz | reuse |
| 301 | node_modules/is-bun-module | 2.0.0 | MIT | https://registry.npmjs.org/is-bun-module/-/is-bun-module-2.0.0.tgz | reuse |
| 302 | node_modules/is-callable | 1.2.7 | MIT | https://registry.npmjs.org/is-callable/-/is-callable-1.2.7.tgz | reuse |
| 303 | node_modules/is-core-module | 2.17.0 | MIT | https://registry.npmjs.org/is-core-module/-/is-core-module-2.17.0.tgz | reuse |
| 304 | node_modules/is-data-view | 1.0.2 | MIT | https://registry.npmjs.org/is-data-view/-/is-data-view-1.0.2.tgz | reuse |
| 305 | node_modules/is-date-object | 1.1.0 | MIT | https://registry.npmjs.org/is-date-object/-/is-date-object-1.1.0.tgz | reuse |
| 306 | node_modules/is-document.all | 1.0.0 | MIT | https://registry.npmjs.org/is-document.all/-/is-document.all-1.0.0.tgz | reuse |
| 307 | node_modules/is-extendable | 0.1.1 | MIT | https://registry.npmjs.org/is-extendable/-/is-extendable-0.1.1.tgz | reuse |
| 308 | node_modules/is-extglob | 2.1.1 | MIT | https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz | reuse |
| 309 | node_modules/is-finalizationregistry | 1.1.1 | MIT | https://registry.npmjs.org/is-finalizationregistry/-/is-finalizationregistry-1.1.1.tgz | reuse |
| 310 | node_modules/is-generator-function | 1.1.2 | MIT | https://registry.npmjs.org/is-generator-function/-/is-generator-function-1.1.2.tgz | reuse |
| 311 | node_modules/is-glob | 4.0.3 | MIT | https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz | reuse |
| 312 | node_modules/is-map | 2.0.3 | MIT | https://registry.npmjs.org/is-map/-/is-map-2.0.3.tgz | reuse |
| 313 | node_modules/is-negative-zero | 2.0.3 | MIT | https://registry.npmjs.org/is-negative-zero/-/is-negative-zero-2.0.3.tgz | reuse |
| 314 | node_modules/is-number | 7.0.0 | MIT | https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz | reuse |
| 315 | node_modules/is-number-object | 1.1.1 | MIT | https://registry.npmjs.org/is-number-object/-/is-number-object-1.1.1.tgz | reuse |
| 316 | node_modules/is-regex | 1.2.1 | MIT | https://registry.npmjs.org/is-regex/-/is-regex-1.2.1.tgz | reuse |
| 317 | node_modules/is-set | 2.0.3 | MIT | https://registry.npmjs.org/is-set/-/is-set-2.0.3.tgz | reuse |
| 318 | node_modules/is-shared-array-buffer | 1.0.4 | MIT | https://registry.npmjs.org/is-shared-array-buffer/-/is-shared-array-buffer-1.0.4.tgz | reuse |
| 319 | node_modules/is-string | 1.1.1 | MIT | https://registry.npmjs.org/is-string/-/is-string-1.1.1.tgz | reuse |
| 320 | node_modules/is-symbol | 1.1.1 | MIT | https://registry.npmjs.org/is-symbol/-/is-symbol-1.1.1.tgz | reuse |
| 321 | node_modules/is-typed-array | 1.1.15 | MIT | https://registry.npmjs.org/is-typed-array/-/is-typed-array-1.1.15.tgz | reuse |
| 322 | node_modules/is-weakmap | 2.0.2 | MIT | https://registry.npmjs.org/is-weakmap/-/is-weakmap-2.0.2.tgz | reuse |
| 323 | node_modules/is-weakref | 1.1.1 | MIT | https://registry.npmjs.org/is-weakref/-/is-weakref-1.1.1.tgz | reuse |
| 324 | node_modules/is-weakset | 2.0.4 | MIT | https://registry.npmjs.org/is-weakset/-/is-weakset-2.0.4.tgz | reuse |
| 325 | node_modules/isarray | 2.0.5 | MIT | https://registry.npmjs.org/isarray/-/isarray-2.0.5.tgz | reuse |
| 326 | node_modules/isexe | 2.0.0 | ISC | https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz | unresolved |
| 327 | node_modules/iterator.prototype | 1.1.5 | MIT | https://registry.npmjs.org/iterator.prototype/-/iterator.prototype-1.1.5.tgz | reuse |
| 328 | node_modules/jiti | 2.7.0 | MIT | https://registry.npmjs.org/jiti/-/jiti-2.7.0.tgz | reuse |
| 329 | node_modules/js-tokens | 4.0.0 | MIT | https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz | reuse |
| 330 | node_modules/js-yaml | 4.3.2 | MIT | https://registry.npmjs.org/js-yaml/-/js-yaml-4.3.2.tgz | reuse |
| 331 | node_modules/jsesc | 3.1.0 | MIT | https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz | reuse |
| 332 | node_modules/json-buffer | 3.0.1 | MIT | https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.1.tgz | reuse |
| 333 | node_modules/json-schema-traverse | 0.4.1 | MIT | https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz | reuse |
| 334 | node_modules/json-stable-stringify-without-jsonify | 1.0.1 | MIT | https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz | reuse |
| 335 | node_modules/json5 | 2.2.3 | MIT | https://registry.npmjs.org/json5/-/json5-2.2.3.tgz | reuse |
| 336 | node_modules/jsx-ast-utils | 3.3.5 | MIT | https://registry.npmjs.org/jsx-ast-utils/-/jsx-ast-utils-3.3.5.tgz | reuse |
| 337 | node_modules/keyv | 4.5.4 | MIT | https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz | reuse |
| 338 | node_modules/kind-of | 6.0.3 | MIT | https://registry.npmjs.org/kind-of/-/kind-of-6.0.3.tgz | reuse |
| 339 | node_modules/language-subtag-registry | 0.3.23 | CC0-1.0 | https://registry.npmjs.org/language-subtag-registry/-/language-subtag-registry-0.3.23.tgz | unresolved |
| 340 | node_modules/language-tags | 1.0.9 | MIT | https://registry.npmjs.org/language-tags/-/language-tags-1.0.9.tgz | reuse |
| 341 | node_modules/levn | 0.4.1 | MIT | https://registry.npmjs.org/levn/-/levn-0.4.1.tgz | reuse |
| 342 | node_modules/lightningcss | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz | unresolved |
| 343 | node_modules/lightningcss-android-arm64 | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz | unresolved |
| 344 | node_modules/lightningcss-darwin-arm64 | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz | unresolved |
| 345 | node_modules/lightningcss-darwin-x64 | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz | unresolved |
| 346 | node_modules/lightningcss-freebsd-x64 | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz | unresolved |
| 347 | node_modules/lightningcss-linux-arm-gnueabihf | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz | unresolved |
| 348 | node_modules/lightningcss-linux-arm64-gnu | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz | unresolved |
| 349 | node_modules/lightningcss-linux-arm64-musl | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz | unresolved |
| 350 | node_modules/lightningcss-linux-x64-gnu | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz | unresolved |
| 351 | node_modules/lightningcss-linux-x64-musl | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz | unresolved |
| 352 | node_modules/lightningcss-win32-arm64-msvc | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz | unresolved |
| 353 | node_modules/lightningcss-win32-x64-msvc | 1.32.0 | MPL-2.0 | https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz | unresolved |
| 354 | node_modules/locate-path | 6.0.0 | MIT | https://registry.npmjs.org/locate-path/-/locate-path-6.0.0.tgz | reuse |
| 355 | node_modules/lodash.merge | 4.6.2 | MIT | https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.2.tgz | reuse |
| 356 | node_modules/loose-envify | 1.4.0 | MIT | https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz | reuse |
| 357 | node_modules/lru-cache | 5.1.1 | ISC | https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz | unresolved |
| 358 | node_modules/magic-string | 0.30.21 | MIT | https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz | reuse |
| 359 | node_modules/math-intrinsics | 1.1.0 | MIT | https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz | reuse |
| 360 | node_modules/merge2 | 1.4.1 | MIT | https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz | reuse |
| 361 | node_modules/micromatch | 4.0.8 | MIT | https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz | reuse |
| 362 | node_modules/minimatch | 3.1.5 | ISC | https://registry.npmjs.org/minimatch/-/minimatch-3.1.5.tgz | unresolved |
| 363 | node_modules/minimist | 1.2.8 | MIT | https://registry.npmjs.org/minimist/-/minimist-1.2.8.tgz | reuse |
| 364 | node_modules/ms | 2.1.3 | MIT | https://registry.npmjs.org/ms/-/ms-2.1.3.tgz | reuse |
| 365 | node_modules/nanoid | 3.3.19 | MIT | https://registry.npmjs.org/nanoid/-/nanoid-3.3.19.tgz | reuse |
| 366 | node_modules/napi-postinstall | 0.3.4 | MIT | https://registry.npmjs.org/napi-postinstall/-/napi-postinstall-0.3.4.tgz | reuse |
| 367 | node_modules/natural-compare | 1.4.0 | MIT | https://registry.npmjs.org/natural-compare/-/natural-compare-1.4.0.tgz | reuse |
| 368 | node_modules/next | 16.4.3 | MIT | https://registry.npmjs.org/next/-/next-16.4.3.tgz | reuse |
| 369 | node_modules/next/node_modules/postcss | 8.5.23 | MIT | https://registry.npmjs.org/postcss/-/postcss-8.5.23.tgz | reuse |
| 370 | node_modules/node-exports-info | 1.6.2 | MIT | https://registry.npmjs.org/node-exports-info/-/node-exports-info-1.6.2.tgz | reuse |
| 371 | node_modules/node-exports-info/node_modules/semver | 6.3.1 | ISC | https://registry.npmjs.org/semver/-/semver-6.3.1.tgz | unresolved |
| 372 | node_modules/node-releases | 2.0.57 | MIT | https://registry.npmjs.org/node-releases/-/node-releases-2.0.57.tgz | reuse |
| 373 | node_modules/object-assign | 4.1.1 | MIT | https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz | reuse |
| 374 | node_modules/object-inspect | 1.13.4 | MIT | https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz | reuse |
| 375 | node_modules/object-keys | 1.1.1 | MIT | https://registry.npmjs.org/object-keys/-/object-keys-1.1.1.tgz | reuse |
| 376 | node_modules/object.assign | 4.1.7 | MIT | https://registry.npmjs.org/object.assign/-/object.assign-4.1.7.tgz | reuse |
| 377 | node_modules/object.entries | 1.1.9 | MIT | https://registry.npmjs.org/object.entries/-/object.entries-1.1.9.tgz | reuse |
| 378 | node_modules/object.fromentries | 2.0.8 | MIT | https://registry.npmjs.org/object.fromentries/-/object.fromentries-2.0.8.tgz | reuse |
| 379 | node_modules/object.groupby | 1.0.3 | MIT | https://registry.npmjs.org/object.groupby/-/object.groupby-1.0.3.tgz | reuse |
| 380 | node_modules/object.values | 1.2.1 | MIT | https://registry.npmjs.org/object.values/-/object.values-1.2.1.tgz | reuse |
| 381 | node_modules/optionator | 0.9.4 | MIT | https://registry.npmjs.org/optionator/-/optionator-0.9.4.tgz | reuse |
| 382 | node_modules/own-keys | 1.0.2 | MIT | https://registry.npmjs.org/own-keys/-/own-keys-1.0.2.tgz | reuse |
| 383 | node_modules/p-limit | 3.1.0 | MIT | https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz | reuse |
| 384 | node_modules/p-locate | 5.0.0 | MIT | https://registry.npmjs.org/p-locate/-/p-locate-5.0.0.tgz | reuse |
| 385 | node_modules/parent-module | 1.0.1 | MIT | https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz | reuse |
| 386 | node_modules/parse5 | 7.3.0 | MIT | https://registry.npmjs.org/parse5/-/parse5-7.3.0.tgz | reuse |
| 387 | node_modules/path-exists | 4.0.0 | MIT | https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz | reuse |
| 388 | node_modules/path-key | 3.1.1 | MIT | https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz | reuse |
| 389 | node_modules/path-parse | 1.0.7 | MIT | https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz | reuse |
| 390 | node_modules/pdfjs-dist | 6.3.289 | Apache-2.0 | https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-6.3.289.tgz | reuse |
| 391 | node_modules/picocolors | 1.1.1 | ISC | https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz | unresolved |
| 392 | node_modules/picomatch | 2.3.2 | MIT | https://registry.npmjs.org/picomatch/-/picomatch-2.3.2.tgz | reuse |
| 393 | node_modules/playwright | 1.63.0 | Apache-2.0 | https://registry.npmjs.org/playwright/-/playwright-1.63.0.tgz | reuse |
| 394 | node_modules/playwright-core | 1.63.0 | Apache-2.0 | https://registry.npmjs.org/playwright-core/-/playwright-core-1.63.0.tgz | reuse |
| 395 | node_modules/possible-typed-array-names | 1.1.0 | MIT | https://registry.npmjs.org/possible-typed-array-names/-/possible-typed-array-names-1.1.0.tgz | reuse |
| 396 | node_modules/postcss | 8.5.28 | MIT | https://registry.npmjs.org/postcss/-/postcss-8.5.28.tgz | reuse |
| 397 | node_modules/prelude-ls | 1.2.1 | MIT | https://registry.npmjs.org/prelude-ls/-/prelude-ls-1.2.1.tgz | reuse |
| 398 | node_modules/prop-types | 15.8.1 | MIT | https://registry.npmjs.org/prop-types/-/prop-types-15.8.1.tgz | reuse |
| 399 | node_modules/punycode | 2.3.1 | MIT | https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz | reuse |
| 400 | node_modules/queue-microtask | 1.2.3 | MIT | https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz | reuse |
| 401 | node_modules/react | 19.3.0 | MIT | https://registry.npmjs.org/react/-/react-19.3.0.tgz | reuse |
| 402 | node_modules/react-dom | 19.3.0 | MIT | https://registry.npmjs.org/react-dom/-/react-dom-19.3.0.tgz | reuse |
| 403 | node_modules/react-is | 16.13.1 | MIT | https://registry.npmjs.org/react-is/-/react-is-16.13.1.tgz | reuse |
| 404 | node_modules/reflect.getprototypeof | 1.0.10 | MIT | https://registry.npmjs.org/reflect.getprototypeof/-/reflect.getprototypeof-1.0.10.tgz | reuse |
| 405 | node_modules/regexp.prototype.flags | 1.5.4 | MIT | https://registry.npmjs.org/regexp.prototype.flags/-/regexp.prototype.flags-1.5.4.tgz | reuse |
| 406 | node_modules/resolve | 2.0.0-next.7 | MIT | https://registry.npmjs.org/resolve/-/resolve-2.0.0-next.7.tgz | reuse |
| 407 | node_modules/resolve-from | 4.0.0 | MIT | https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz | reuse |
| 408 | node_modules/resolve-pkg-maps | 1.0.0 | MIT | https://registry.npmjs.org/resolve-pkg-maps/-/resolve-pkg-maps-1.0.0.tgz | reuse |
| 409 | node_modules/reusify | 1.1.0 | MIT | https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz | reuse |
| 410 | node_modules/run-parallel | 1.2.0 | MIT | https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz | reuse |
| 411 | node_modules/safe-array-concat | 1.1.4 | MIT | https://registry.npmjs.org/safe-array-concat/-/safe-array-concat-1.1.4.tgz | reuse |
| 412 | node_modules/safe-push-apply | 1.0.0 | MIT | https://registry.npmjs.org/safe-push-apply/-/safe-push-apply-1.0.0.tgz | reuse |
| 413 | node_modules/safe-regex-test | 1.1.0 | MIT | https://registry.npmjs.org/safe-regex-test/-/safe-regex-test-1.1.0.tgz | reuse |
| 414 | node_modules/scheduler | 0.28.0 | MIT | https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz | reuse |
| 415 | node_modules/section-matter | 1.0.0 | MIT | https://registry.npmjs.org/section-matter/-/section-matter-1.0.0.tgz | reuse |
| 416 | node_modules/semver | 7.8.5 | ISC | https://registry.npmjs.org/semver/-/semver-7.8.5.tgz | unresolved |
| 417 | node_modules/set-function-length | 1.2.2 | MIT | https://registry.npmjs.org/set-function-length/-/set-function-length-1.2.2.tgz | reuse |
| 418 | node_modules/set-function-name | 2.0.2 | MIT | https://registry.npmjs.org/set-function-name/-/set-function-name-2.0.2.tgz | reuse |
| 419 | node_modules/set-proto | 1.0.0 | MIT | https://registry.npmjs.org/set-proto/-/set-proto-1.0.0.tgz | reuse |
| 420 | node_modules/sharp | 0.35.5 | Apache-2.0 | https://registry.npmjs.org/sharp/-/sharp-0.35.5.tgz | reuse |
| 421 | node_modules/shebang-command | 2.0.0 | MIT | https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz | reuse |
| 422 | node_modules/shebang-regex | 3.0.0 | MIT | https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz | reuse |
| 423 | node_modules/side-channel | 1.1.1 | MIT | https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz | reuse |
| 424 | node_modules/side-channel-list | 1.0.1 | MIT | https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz | reuse |
| 425 | node_modules/side-channel-map | 1.0.1 | MIT | https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz | reuse |
| 426 | node_modules/side-channel-weakmap | 1.0.2 | MIT | https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz | reuse |
| 427 | node_modules/source-map-js | 1.2.2 | BSD-3-Clause | https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz | reuse |
| 428 | node_modules/sprintf-js | 1.0.3 | BSD-3-Clause | https://registry.npmjs.org/sprintf-js/-/sprintf-js-1.0.3.tgz | reuse |
| 429 | node_modules/stable-hash | 0.0.5 | MIT | https://registry.npmjs.org/stable-hash/-/stable-hash-0.0.5.tgz | reuse |
| 430 | node_modules/stop-iteration-iterator | 1.1.0 | MIT | https://registry.npmjs.org/stop-iteration-iterator/-/stop-iteration-iterator-1.1.0.tgz | reuse |
| 431 | node_modules/string.prototype.includes | 2.0.1 | MIT | https://registry.npmjs.org/string.prototype.includes/-/string.prototype.includes-2.0.1.tgz | reuse |
| 432 | node_modules/string.prototype.matchall | 4.1.0 | MIT | https://registry.npmjs.org/string.prototype.matchall/-/string.prototype.matchall-4.1.0.tgz | reuse |
| 433 | node_modules/string.prototype.repeat | 1.0.0 | MIT | https://registry.npmjs.org/string.prototype.repeat/-/string.prototype.repeat-1.0.0.tgz | reuse |
| 434 | node_modules/string.prototype.trim | 1.2.11 | MIT | https://registry.npmjs.org/string.prototype.trim/-/string.prototype.trim-1.2.11.tgz | reuse |
| 435 | node_modules/string.prototype.trimend | 1.0.10 | MIT | https://registry.npmjs.org/string.prototype.trimend/-/string.prototype.trimend-1.0.10.tgz | reuse |
| 436 | node_modules/string.prototype.trimstart | 1.0.8 | MIT | https://registry.npmjs.org/string.prototype.trimstart/-/string.prototype.trimstart-1.0.8.tgz | reuse |
| 437 | node_modules/strip-bom | 3.0.0 | MIT | https://registry.npmjs.org/strip-bom/-/strip-bom-3.0.0.tgz | reuse |
| 438 | node_modules/strip-bom-string | 1.0.0 | MIT | https://registry.npmjs.org/strip-bom-string/-/strip-bom-string-1.0.0.tgz | reuse |
| 439 | node_modules/strip-json-comments | 3.1.1 | MIT | https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz | reuse |
| 440 | node_modules/styled-jsx | 5.1.6 | MIT | https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.6.tgz | reuse |
| 441 | node_modules/supports-color | 7.2.0 | MIT | https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz | reuse |
| 442 | node_modules/supports-preserve-symlinks-flag | 1.0.0 | MIT | https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz | reuse |
| 443 | node_modules/tailwindcss | 4.3.3 | MIT | https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.3.3.tgz | reuse |
| 444 | node_modules/tapable | 2.3.3 | MIT | https://registry.npmjs.org/tapable/-/tapable-2.3.3.tgz | reuse |
| 445 | node_modules/tinyglobby | 0.2.17 | MIT | https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz | reuse |
| 446 | node_modules/tinyglobby/node_modules/fdir | 6.5.0 | MIT | https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz | reuse |
| 447 | node_modules/tinyglobby/node_modules/picomatch | 4.0.7 | MIT | https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz | reuse |
| 448 | node_modules/to-regex-range | 5.0.1 | MIT | https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz | reuse |
| 449 | node_modules/ts-api-utils | 2.5.0 | MIT | https://registry.npmjs.org/ts-api-utils/-/ts-api-utils-2.5.0.tgz | reuse |
| 450 | node_modules/tsconfig-paths | 3.15.0 | MIT | https://registry.npmjs.org/tsconfig-paths/-/tsconfig-paths-3.15.0.tgz | reuse |
| 451 | node_modules/tsconfig-paths/node_modules/json5 | 1.0.2 | MIT | https://registry.npmjs.org/json5/-/json5-1.0.2.tgz | reuse |
| 452 | node_modules/tslib | 2.8.1 | 0BSD | https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz | reuse |
| 453 | node_modules/type-check | 0.4.0 | MIT | https://registry.npmjs.org/type-check/-/type-check-0.4.0.tgz | reuse |
| 454 | node_modules/typed-array-buffer | 1.0.3 | MIT | https://registry.npmjs.org/typed-array-buffer/-/typed-array-buffer-1.0.3.tgz | reuse |
| 455 | node_modules/typed-array-byte-length | 1.0.3 | MIT | https://registry.npmjs.org/typed-array-byte-length/-/typed-array-byte-length-1.0.3.tgz | reuse |
| 456 | node_modules/typed-array-byte-offset | 1.0.5 | MIT | https://registry.npmjs.org/typed-array-byte-offset/-/typed-array-byte-offset-1.0.5.tgz | reuse |
| 457 | node_modules/typed-array-length | 1.0.8 | MIT | https://registry.npmjs.org/typed-array-length/-/typed-array-length-1.0.8.tgz | reuse |
| 458 | node_modules/typescript | 5.9.3 | Apache-2.0 | https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz | reuse |
| 459 | node_modules/typescript-eslint | 8.70.1 | MIT | https://registry.npmjs.org/typescript-eslint/-/typescript-eslint-8.70.1.tgz | reuse |
| 460 | node_modules/unbox-primitive | 1.1.0 | MIT | https://registry.npmjs.org/unbox-primitive/-/unbox-primitive-1.1.0.tgz | reuse |
| 461 | node_modules/undici-types | 7.24.6 | MIT | https://registry.npmjs.org/undici-types/-/undici-types-7.24.6.tgz | reuse |
| 462 | node_modules/unrs-resolver | 1.12.2 | MIT | https://registry.npmjs.org/unrs-resolver/-/unrs-resolver-1.12.2.tgz | reuse |
| 463 | node_modules/update-browserslist-db | 1.3.3 | MIT | https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.3.3.tgz | reuse |
| 464 | node_modules/uri-js | 4.4.1 | BSD-2-Clause | https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz | reuse |
| 465 | node_modules/which | 2.0.2 | ISC | https://registry.npmjs.org/which/-/which-2.0.2.tgz | unresolved |
| 466 | node_modules/which-boxed-primitive | 1.1.1 | MIT | https://registry.npmjs.org/which-boxed-primitive/-/which-boxed-primitive-1.1.1.tgz | reuse |
| 467 | node_modules/which-builtin-type | 1.2.1 | MIT | https://registry.npmjs.org/which-builtin-type/-/which-builtin-type-1.2.1.tgz | reuse |
| 468 | node_modules/which-collection | 1.0.2 | MIT | https://registry.npmjs.org/which-collection/-/which-collection-1.0.2.tgz | reuse |
| 469 | node_modules/which-typed-array | 1.1.23 | MIT | https://registry.npmjs.org/which-typed-array/-/which-typed-array-1.1.23.tgz | reuse |
| 470 | node_modules/word-wrap | 1.2.5 | MIT | https://registry.npmjs.org/word-wrap/-/word-wrap-1.2.5.tgz | reuse |
| 471 | node_modules/yallist | 3.1.1 | ISC | https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz | unresolved |
| 472 | node_modules/yocto-queue | 0.1.0 | MIT | https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz | reuse |
| 473 | node_modules/zod | 4.6.7 | MIT | https://registry.npmjs.org/zod/-/zod-4.6.7.tgz | reuse |
| 474 | node_modules/zod-validation-error | 4.0.2 | MIT | https://registry.npmjs.org/zod-validation-error/-/zod-validation-error-4.0.2.tgz | reuse |


## Direct dependencies (root `package.json`)

- `next` 16.4.3 — dependency `sharp` (resolved 0.35.5)
- `parse5` 7.3.0
- `pdfjs-dist` 6.3.289
- `react` 19.3.0
- `react-dom` 19.3.0

Dev dependencies: `@axe-core/playwright`, `@playwright/test`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `gray-matter`, `playwright`, `tailwindcss`, `typescript`.

## Sharp / libvips (LGPL — unresolved, not cleared)

`sharp` 0.35.5 — declared licence Apache-2.0, optional dependency of `next`. Source: https://registry.npmjs.org/sharp/-/sharp-0.35.5.tgz. Funds libvips via opencollective.com/libvips.

Sharp's optional platform bindings (`@img/sharp-*`) carry declared licences per package. Their `sharp-libvips-*` optionalDependencies declare **LGPL-3.0-or-later** (libvips). Four conjunctive Sharp Windows/wasm bindings declare **Apache-2.0 AND LGPL-3.0-or-later** or **Apache-2.0 AND LGPL-3.0-or-later AND MIT**. SPDX AND means every conjunct applies, so these carry LGPL obligations too.

These copyleft components are present in the lockfile. Whether they are redistributed by this site's build output is **unresolved** and is recorded here for Andy or the solicitor, **not described as legally cleared**.

Sharp libvips platform packages (all optional, declared licence LGPL-3.0-or-later):
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

- ISC and other non-reuse packages: reuse interpretation unresolved per estate licence route (MIT/Apache/BSD only).
- Sharp/libvips LGPL-3.0-or-later redistribution interpretation: not established. Recorded as unresolved; not described as legally cleared.
- Conjunctive Sharp packages containing LGPL-3.0-or-later; redistribution interpretation unresolved.
- MPL-2.0 packages: reuse interpretation unresolved.
- No copyleft/source-available/unlicensed obligation is presented as cleared in this record.

## What this record does not do

- Does not add a root licence (LICENSE / LICENSE.md / COPYING unchanged).
- Does not change dependencies, package.json, or package-lock.json beyond the security patch that produced this candidate.
- Does not download licence data or contact any service.
- Does not resolve legal ambiguity in code.
- Does not touch deploy/, .do/, .github/, Dockerfile, docker-compose*, .env*, nginx, startup, voice/telephony/product backend/production data.
