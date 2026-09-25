# Step 50 — Website Manager closed loop

Date: 2026-09-26
Owner: MOS Website Manager

## Goal

Close the original 50-step website improvement programme with one controlled operating loop:

**monitor → detect → repair → test → deploy → verify → record**

The loop composes controls already implemented in Steps 7, 9, 46, 47, 48, and 49. It is intentionally thin; it does not introduce another monitoring platform, deployment system, or repair engine.

## Commands

### 1. Monitor + detect

```bash
npm run manager:monitor
```

Runs:
- the existing live website health monitor;
- the existing live SEO monitor.

It writes a gitignored `.website-manager/monitor.json`.

If both pass, status is `healthy` and repair is **not required**.

If either fails, status is `repair_required`. The loop stops. Do not repair a healthy site and do not make a speculative broad change.

### 2. Repair

When detection reports a real failure:
1. inspect the exact failing gate;
2. search/reuse existing estate or safe public components first;
3. make the smallest evidence-backed repair on a branch;
4. commit it;
5. rerun `manager:monitor` until healthy.

There is deliberately no generic automatic code mutation. A broken link, bad canonical, deployment lag, backend outage, accessibility regression, and performance regression require different remedies. Blind repair would be less safe than the controls it is meant to protect.

For a healthy release cycle, repair status is recorded as `not_required_current_monitor_healthy`.

### 3. Test

From a clean committed branch:

```bash
npm run manager:preflight
```

This reuses Step 49 `release:preflight`, which runs:
- full repository tests;
- production static build;
- Step 46 performance budget;
- Step 47 accessibility gate;
- exact branch release-marker checks.

### 4. Deploy

Deploy by PR into `main` only.

The Website Manager script does not directly deploy, mutate DigitalOcean output, merge a PR, reset history, force-push, or touch voice/backend infrastructure. The existing DigitalOcean Git deployment remains the sole website deployment path.

### 5. Verify

After the PR merge SHA is known and DigitalOcean has deployed it:

```bash
EXPECTED_COMMIT=<merge-sha> npm run manager:verify
```

This reuses Step 48 `release:verify`: live `/release.json` must match the intended SHA, then the live health monitor must pass.

### 6. Record

```bash
WEBSITE_MANAGER_PR_NUMBER=<pr> npm run manager:record
```

The record phase refuses to run unless:
- monitor/detect is healthy;
- preflight passed;
- deployment verification passed.

It writes a local gitignored evidence record and posts the concise evidence as a durable PR comment on the release PR. This avoids creating a documentation-only commit that would itself create a new deployment SHA.

## State

Transient loop state lives under `.website-manager/` and is gitignored. It contains only bounded operational results and commit identifiers; it does not dump environment variables or secrets.

## Reuse / cost

Reused:
- Step 7 SEO monitor;
- Step 9 website health monitor;
- Step 46 performance budget;
- Step 47 accessibility gate;
- Step 48 exact release marker / deployment verifier;
- Step 49 preflight / PR / rollback controls;
- existing GitHub and DigitalOcean deployment.

No new service, daemon, scheduler, database, paid tool, Actions workflow, agent framework, or telephony/runtime path is added.

## Completion gate

Step 50 is complete only after this loop is executed on its own release:
1. manager monitor healthy;
2. repair explicitly not required or documented;
3. manager preflight passed;
4. PR merged to main;
5. exact merge SHA live and verified;
6. manager record posted to that PR;
7. final `main` clean and live release identity matched.
