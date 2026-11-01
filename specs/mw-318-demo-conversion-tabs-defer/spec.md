# Spec: mw-318 demo conversion tabs deferral

## Problem
`/demo` statically imports `DemoConversionTabs`, pulling the full client-side tab logic (hash-store, hashchange listeners, scroll sync) into initial JS.

## Scope
- Add `DeferredDemoConversionTabs` using `next/dynamic` (`ssr: false`) with accessible loading placeholder
- Switch `/demo` to the deferred wrapper
- Lock with `scripts/demo-conversion-tabs-deferral.test.mjs`

## Out of scope
- Changing DemoConversionTabs behaviour
- publicLaunch, deploy, frozen paths
