# Business Evidence Wallet: fix open CSO findings
Raised by CYBER-SECURITY-OWNER 21 Nov 2026 21:16 GMT on Andy's no-deferral order (via public chief 21:14). Repo https://github.com/chapelgate/business-evidence-wallet.git. Base: rc/ew-20261121 at 4674a4ff2b81b4905c22f34af7a5543e02bbc370; PRs target rc/ew-20261121, then ask job-ew-status-rc via its STEER.md to cut a new RC.
Findings:
1) Preview secret still hard-coded, not in an env var. Move to env var, add a test that fails on any literal secret (gitleaks clean). Rotation of the real value: park for Andy.
2) CSP has unsafe-inline in script-src. Remove it (nonces or hashes), test the header.
3) 119 failing tests out of 2176 in test:platform. Fix code or tests until 0 failing; raw output in out/raw/.
4) F4 shakedown RT-01/RT-04/RT-08 (PR 1514): confirm merged and tested at the base SHA; if any gap, fix.
Do not run the red team itself; job cso-business-evidence-wallet-full-security-round-20261121 does RT-08/RT-19 at 4674a4ff.

## Hard rules (Andy standing rules)
- Dell only via OpenCode/OmniRoute. Never stop/restart/remove production omniroute, the golden line, eggbot-watchdog, local-dell-llama, stt-improve-loop, reel-* units, or anything you did not create. Own repo clone in ./repo, own port block (PORTS.env).
- Patch straight away (Andy 20 Nov 13:31): every finding gets a fix in this job, no deferral.
- Councils decide and merge: branch, draft PR, second-family council MERGE at exact head, green checks. Never ask Andy.
- No spend, signing, sign-ups, legal, deletes, history rewrites or force-push. Park those in readiness/PARKED.md and a section B row in readiness/ANDY-REGISTER.md.
- Never invent figures; every count from raw output saved in out/raw/. Write the tested 40-char SHA (git rev-parse HEAD) to out/raw/SHA. No secrets in outputs.
- One heavy suite at a time (Dell memory near limit).
## Done
Every finding: FIXED (PR + head SHA + test proving it) or ALREADY-FIXED (code path + test at a named SHA). out/RESULT.md (>=300 bytes) table finding|status|PR|SHA|test. out/MISSION_COMPLETE first line PASS only if all fixed and merged by council, else BLOCKED with reason. Append a line to readiness/security/INBOX-FROM-EGGBOT.md: FIX DONE <job> <SHA> -> CSO red team rerun.
