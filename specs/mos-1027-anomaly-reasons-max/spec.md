# mos-1027-anomaly-reasons-max

## Goal
Fail closed when Invoice.anomaly_reasons JSON would exceed 2000 characters on invoice_qa write.

## Acceptance
- operations.ANOMALY_REASONS_MAX == 2000
- invoice_qa refuses (returns None) when json.dumps(reasons) exceeds the max
- tests/test_anomaly_reasons_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
