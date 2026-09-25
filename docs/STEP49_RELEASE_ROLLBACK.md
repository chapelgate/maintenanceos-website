# Step 49 — safe deployment, rollback, and change control

Date: 2026-09-25
Owner: MOS Website Manager

## Goal

A website change must be testable before merge, traceable after deployment, and reversible without rewriting shared history or touching the MaintenanceOS voice/backend runtime.

## Reuse decision

Step 49 reuses:
- Git / GitHub pull requests for change history;
- Step 46 `performance:budget`;
- Step 47 `accessibility:check`;
- Step 48 `release.json` and `deployment:verify`;
- the existing DigitalOcean static deployment.

A GitHub reuse search was also run for rollback tooling. The relevant public projects target other deployment stacks (for example Ansible or ECS) and would add unnecessary dependency/runtime surface. No external rollback package is installed.

## Pre-merge release gate

Run from a clean branch:

```bash
npm run release:preflight
```

It requires a clean Git working tree and then runs, in order:
1. full repository tests;
2. production static build;
3. performance budget;
4. accessibility gate;
5. release-marker check: generated `public/release.json` must match the exact branch HEAD;
6. static export must contain `out/release.json`.

The command is cross-platform: when invoked through `npm run`, it executes the npm CLI through Node’s `npm_execpath` rather than relying on a platform-specific shell command.

## Change-control rule

Production changes go through a PR into `main`. The PR/merge history is the change record.

Do not:
- edit the DigitalOcean static output by hand;
- never force-push `main`;
- use `git reset --hard` to rewrite shared history;
- repair a website regression by touching MaintenanceOS voice/backend infrastructure.

## Post-merge deployment gate

After the merge SHA is known:

```bash
EXPECTED_COMMIT=<merge-sha> npm run release:verify
```

This is the Step-48 exact-deployment verifier: the live `/release.json` must equal the intended merge SHA, then the existing live health monitor must pass.

## Rollback

Generate a safe, non-mutating rollback plan:

```bash
npm run rollback:plan -- <bad-commit-sha>
```

The plan:
1. starts from updated `main`;
2. creates a dedicated rollback branch;
3. uses `git revert --no-edit <bad-sha>` to preserve history;
4. reruns `release:preflight`;
5. pushes the rollback branch and opens a PR;
6. after merge, reruns exact deployment verification against the rollback merge SHA.

The planner prints commands only. It does not execute a revert, push, PR, deployment, reset, or force-push.

## Isolation

Website rollback is isolated to `chapelgate/maintenanceos-website`. A marketing-site failure is not authority to modify the MaintenanceOS product repo, live phone path, Railway voice services, or any other estate runtime.

## Cost

No new deployment service, rollback product, Actions workflow, paid runner, database, or monitoring SaaS is introduced.

## Status

Implementation complete; final status remains pending live verification of the merged Step-49 release.
