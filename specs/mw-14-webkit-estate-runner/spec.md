# mw-14-webkit-estate-runner

## Problem

`webkit-a11y` asks for `ubuntu-latest`. That job ends in about two seconds with no steps, so the accessibility check never runs and the draft PRs stay red.

## Cause

Hosted GitHub minutes are not available. The website already has a self-hosted runner labelled `estate`, and the estate gate already uses it.

## Acceptance

- `.github/workflows/webkit-a11y.yml` runs on `[self-hosted, estate]`.
- It does not mention `ubuntu-latest` or `pull_request_target`.
- Actions are pinned to 40-character commit SHAs.
- Token permissions are `contents: read` and `actions: write`.
- Same-repo pull requests run. The job does not request `secrets`.
- Playwright WebKit is installed without `--with-deps`.
- `node --test scripts/webkit-runner.test.mjs` exits 0.
