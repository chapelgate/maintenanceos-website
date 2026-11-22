# EVIDENCE — Release Truth Rescore 20261120

All figures below are taken from raw output files under factory-tasks/*/out on the Dell. No figures are invented.

## Source files consulted

| Evidence | Path |
|----------|------|
| RELEASE_STATUS (previous, backed up) | jobs-work-dell/readiness/.bak-release-truth-20261120-*.md |
| HCV red team round 3 RESULT | factory-tasks/redteam15-r2-housing-compliance-vault-20261116/out/RESULT.md |
| HCV red team round 3 EVIDENCE | factory-tasks/redteam15-r2-housing-compliance-vault-20261116/out/EVIDENCE.md |
| HCV rl20 EVIDENCE | factory-tasks/rl20-housing-compliance-vault-20261116/out/EVIDENCE.md |
| rt15-fix run output | factory-tasks/rt15-fix-hcv-council-minutes-20261118/out/ |
| HCV hard-25 RESULTS | factory-tasks/hard25-20261113/09-housing-compliance-vault/out/hard25/RESULTS.md |
| HCV hard-25 TIMINGS | factory-tasks/hard25-20261113/09-housing-compliance-vault/out/hard25/TIMINGS.csv |
| HCV hard-25 dir listing | factory-tasks/hard25-20261113/09-housing-compliance-vault/out/hard25/ |

## Verified raw counts (from raw output)

| Product | Evidence type | Count | SHA | Source |
|---------|--------------|-------|-----|--------|
| hcv | red team round 3 | 15/15 PASS | 59d6f643 | redteam15-r2-housing-compliance-vault-20261116/out/RESULT.md |
| hcv | rl20 | 20/20 PASS | 44653da1773ae045ed51911021243d47f05cd51b | rl20-housing-compliance-vault-20261116/out/EVIDENCE.md |

## HCV PR #1507 determination

The redteam15-r2-housing-compliance-vault-20261116 run executed on 16 Nov 2026 against SHA 59d6f643, which includes PR #1507 fixes. Result: 15/15 PASS (RT-01 through RT-15 all blocked). Source: out/RESULT.md.

The rt15-fix-hcv-council-minutes-20261118 run (18 Nov) has an empty repo directory and no MISSION_COMPLETE file — it appears incomplete or rejected, and does not supersede the 16 Nov round.

END EVIDENCE