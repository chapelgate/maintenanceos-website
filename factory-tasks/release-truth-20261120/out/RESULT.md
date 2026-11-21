# Release Result — 21 Nov 2026

Final evidence-based rescore table for all 12 products, superseding the 16 Nov rescore (factory-tasks/rescore-12-products-20261116). All counts, SHAs, red-team rounds and test results are taken from raw output files under factory-tasks/*/out on the Dell. No figures are invented.

SHAs reported here are taken from raw evidence files or the repo head SHA f0838df099d5e14c76eecda6bf6c4d7466043fc8. SHA 44653da1773ae045ed51911021243d47f05cd51b (rl20 HCV commit) was NOT found in any Dell repo during verification; it is reported only as stated in the raw rl20 evidence file.

## Final Table

| Product | Code | Hard-25 | Unit Tests | Red Team | rl20 | State | Nearness | Verdict |
|---------|------|---------|------------|----------|------|-------|----------|---------|
| Council Minutes | cm | 25/25 PASS | 329 collected (suite not run — timeout) | Not separate | N/A | ACTIVE | 7 | NO-GO (Andy gates only) |
| IR Complaints | b18 | 25/25 PASS | 962 collected (7 focused passed) | Not separate | N/A | ACTIVE | 2 | NO-GO |
| Citizen Agent | ca | 25/25 PASS | 25 hard25 passed | Not separate | N/A | ACTIVE | 5 | NO-GO |
| Multilingual Transcribe | mt | 75/75 PASS | 296 fast suite | Not separate | N/A | ACTIVE | 4 | NO-GO |
| Holiday Let Operator | hl | 25/25 PASS | Commercial audit 20/20 | Not separate | N/A | ACTIVE | 4 | NO-GO |
| MaintenanceOS Website | mw | 25/25 PASS | 630 tests; 9/9 gate | Not separate | N/A | ACTIVE | 4 | NO-GO |
| Business Evidence Wallet | ew | 21 pass / 48 fail | Typecheck + 216+61+308+617 | Not separate | N/A | ACTIVE | 4 | NO-GO |
| MaintenanceOS | mos | IN_PROGRESS | 19 passed | Not separate | N/A | ACTIVE | 4 | NO-GO |
| Legal Case Mgmt | lcm | 25/25 PASS | 25 local | Not separate | N/A | ACTIVE | 6 | NO-GO |
| Information Rights | ir | 25/25 PASS | 1624 collected (suite not run — timeout) | Not separate | N/A | ACTIVE | 4 | NO-GO |
| Housing Compliance Vault | hcv | 25/25 PASS | Module tests NOT RUN | Round 3: 15/15 PASS (SHA 59d6f643, incl. PR #1507) | 20/20 PASS (commit 44653da — not found in Dell repo; repo head SHA f0838df099d5e14c76eecda6bf6c4d7466043fc8) | HOLD | 3 | NO-GO |
| Business OS Website | cw | 25/25 PASS | 25 hard stress | Not separate | N/A | ACTIVE | 6 | NO-GO |

## Source raw output files

- Council Minutes hard-25: factory-tasks/hard25-20261113/11-council-minutes/out/runs/prev-20261119-0102/hard25/RESULTS.md
- IR Complaints hard-25: factory-tasks/hard25-20261113/12-information-rights-complaints/out/hard25/RESULTS.md
- Citizen Agent hard-25: factory-tasks/hard25-20261113/02-public-sector-citizen-agent/out/hard25/RESULTS.md
- MT hard-25 raw output: factory-tasks/hard25-20261113/07-chapelgate-multilingual-transcribe/out/hard25/raw/pytest-output.txt
- HL hard-25: factory-tasks/hard25-20261113/08-holiday-let-operator/out/hard25/RESULTS.md
- MW hard-25: factory-tasks/hard25-20261113/04-maintenanceos-website/out/hard25/RESULTS.md
- EW hard-25: factory-tasks/hard25-20261113/10-business-evidence-wallet/out/hard25/RESULTS.md
- MOS hard-25: factory-tasks/hard25-20261113/03-maintenanceos/out/hard25/RESULTS.md
- LCM hard-25: factory-tasks/hard25-20261113/05-legal-case-management/out/hard25/RESULTS.md
- IR hard-25: factory-tasks/hard25-20261113/06-chapelgate-information-rights/out/runs/prev-20261119-0102/hard25/RESULTS.md
- HCV hard-25: factory-tasks/hard25-20261113/09-housing-compliance-vault/out/hard25/RESULTS.md
- CW hard-25: factory-tasks/hard25-20261113/01-business-os/out/hard25/RESULTS.md
- HCV red team round 3: factory-tasks/redteam15-r2-housing-compliance-vault-20261116/out/RESULT.md
- HCV rl20: factory-tasks/rl20-housing-compliance-vault-20261116/out/EVIDENCE.md

## HCV Red Team Round 3 — PR #1507 Determination

**Confirmed: HCV red team round 3 ran on 16 Nov 2026 against SHA 59d6f643, which includes the PR #1507 fixes.** Result: 15/15 PASS on port 4700 (source: redteam15-r2-housing-compliance-vault-20261116/out/RESULT.md).

The rt15-fix-hcv-council-minutes-20261118 run (18 Nov) has an empty repo directory and no MISSION_COMPLETE file — it appears incomplete or rejected, and does not supersede the 16 Nov round.

**rl20 HCV:** Ran against commit 44653da1773ae045ed51911021243d47f05cd51b, result 20/20 PASS (source: rl20-housing-compliance-vault-20261116/out/EVIDENCE.md). Note: this SHA was not found in any Dell repo during verification; it is reported as stated in the raw rl20 evidence file.

## Jobs-work-dell / repo

This job ran under factory-tasks/release-truth-20261120/repo (head SHA f0838df099d5e14c76eecda6bf6c4d7466043fc8). Job ID J0241.

## Gates Remaining

- All 12 products: NO-GO for commercial release. Every product has Andy-only LAST GATES (host, legal, certs, price, support, live acceptance) that engineering cannot clear.
- ISO 9001 QMS Evidence: BLOCKED (7/12 repos, Council B FAIL 7/7).
- PR #140 independent audit: HOLD (0 critical/0 high not achieved at real head).
- HB-001..010 (insurance, professional indemnity, Cyber Essentials, legal/ICO, accounts, independent human review) are Andy's last-minute responsibility, NOT engineering completion conditions.
