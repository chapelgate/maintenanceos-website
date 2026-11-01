# Synthetic Buyer Onboarding Kit

Status: SYNTHETIC ONLY / NOT A SALE / NOT A LIVE ONBOARDING AUTHORISATION

This kit is for Chapelgate internal demos and tender evidence. It uses synthetic fixtures only. It does not onboard a real buyer, take live personal data, arm the golden phone line, or set `commercial_release_ready` true.

## What this kit is

- A local walkthrough of WorkSmartOS / MaintenanceOS maintenance config on a developer machine.
- Proof that readiness stays fail-closed while market scope is unset or non-social.
- A script Andy can read before any design-partner conversation. It is not permission to start one.

## What this kit is not

- Not a commercial offer, price, or contract.
- Not live customer records, production credentials, or IdP cutover.
- Not a controlled call on the golden phone line.
- Not central monitoring, managed PostgreSQL restore, or a release GO.


## Required step fields (machine-checked)

required_fields: checkout_sha, readiness_false, local_pytest, synthetic_sqlite_only, no_pstn_call, no_golden_line, no_live_pii

Each local demo step must keep these fields covered:
- checkout_sha: disposable worktree at a candidate SHA
- readiness_false: commercial_release_ready prints False
- local_pytest: pytest suite runs on the candidate tree
- synthetic_sqlite_only: dashboard/API against synthetic SQLite only
- no_pstn_call: do not place a PSTN or golden-line call
- no_golden_line: do not touch the frozen golden phone line or voice box
- no_live_pii: do not load resident or live customer PII

## Local synthetic demo steps

1. Check out the candidate SHA on a disposable worktree.
2. Install from the pinned requirements once a lockfile lands; until then use the host test environment.
3. Run `python3 -c 'import readiness; print(readiness.report()["commercial_release_ready"])'` and expect `False`.
4. Run `python3 -m pytest -q` and keep the tree clean afterward.
5. Open the Streamlit dashboard against synthetic SQLite only. Do not point it at production.
6. Stop. Do not place a PSTN call. Do not load resident PII.

## Honesty locks

- `commercial_release_ready` remains false until Andy clears the last gates.
- England social housing stays off.
- Lifecycle and external-identity runtimes stay false.
- Buyer conversations stay on Andy's calendar; this kit does not contact councils or landlords.

## Rollback

Delete this file. No runtime flag depends on it.
