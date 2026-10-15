# Scanner site block

## Problem

`alleygates.co.uk` answers HTTP 403 with an empty body to every GET from the scanner droplet `178.128.171.45`, including `robots.txt` and a normal Chrome user agent. HEAD can return 200. The host is refusing that address. Browser headers and the Chromium fallback cannot read the pages. The check was still presented as a generic failure, and `deploy/maintenanceos-scanner-v2/run.sh` could arrive with CR line endings that make `sh` reject `set -eu`.

## Acceptance

- `.gitattributes` forces LF for `*.sh`, `Dockerfile`, and `deploy/**`. `run.sh` is LF.
- `run.sh` passes `SCANNER_V2_RELEASE_SHA` from `RELEASE_SHA`, default `local`, into the container so the crawl id includes the release.
- A scan that fetches zero pages and records `http_401` or `http_403` returns outcome `blocked_by_site` with warning `blocked_by_site`. A scan that fetched pages, or failed for another reason, does not.
- `/create` says the site blocks automated reading, tells the visitor to type the details or paste site wording, and gives a short line they can send their web host naming scanner address `178.128.171.45`. The next step stays available. The copy does not suggest a proxy or a disguised client.
- No App Platform spec is added to the repo. The voice function snippet lives in the pull request body.
