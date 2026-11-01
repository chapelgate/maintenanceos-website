# Spec: mw-326 ProductUiShell deferral

## Problem
Homepage statically imports ProductUiShell into the hero SSR graph, adding client JS weight to first paint (Lighthouse homepage perf flake risk).

## Scope
- DeferredProductUiShell via next/dynamic (ssr: false)
- Switch homepage to deferred wrapper
- Lock with scripts/product-ui-shell-deferral.test.mjs

## Out of scope
- publicLaunch, scanner, deploy, nginx, golden line, WCAG 2.2 AA claim
