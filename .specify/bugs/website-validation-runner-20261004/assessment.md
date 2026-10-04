# Assessment

## Goal lock

OBJECTIVE -> restore the existing website integration validator so pull-request changes execute and can prove the current website acceptance gates.

ACCEPTANCE CRITERION -> a fresh PR run is claimed by an available runner and the unchanged test/build/browser validation completes successfully.

EVIDENCE/BLOCKER -> the repository had no registered self-hosted runners, so the `estate-trusted` job remained queued. After switching to the existing GitHub-hosted Linux runner, the job executed and proved 439/439 repository tests plus 17/17 accessibility tests, then failed only because the isolated Docker copy had no source SHA available to `write-release-marker.mjs`.

NEXT ACTION -> keep the GitHub-hosted runner and pass the exact PR head SHA into the existing isolated container as `SOURCE_COMMIT_HASH`; change nothing else.

## Reuse / skill preflight

- Applied `chapelgate-skill-first` and `ESTATE_GATE.md`.
- Reuse existing GitHub Actions, existing Docker validation body and existing release-marker environment contract.
- No new runner, service, dependency, queue, database, secret or infrastructure.
- Work class: BUG.
