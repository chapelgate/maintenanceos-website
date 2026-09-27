# MaintenanceOS Master Problem Log

## 2026-09-27 — Temporary voice canary cost drift
Status: RESOLVED

- Problem: DigitalOcean droplet 602509753 (`maintenanceos-local-voice-canary-temp`) remained active at $48/month after Gemini/Gacrux became the accepted voice baseline.
- Safety requirement: do not disturb the accepted MaintenanceOS telephone path.
- Accepted baseline evidence: droplet 601962983, public endpoint 165.227.227.9, Gemini/Gacrux, frozen in commit 4f5bb42cbb267ad040273932a97e9090425496de.
- Preservation: snapshot 247299118 (`maintenanceos-local-voice-canary-final-archive-20260927`) completed and is available in lon1.
- Resolution: droplet 602509753 deleted after snapshot completion.
- Verification: accepted runtime droplet 601962983 remained active after deletion.
- Result: DigitalOcean Droplet plan run-rate reduced from $164/month to $116/month.

## 2026-09-27 — Concurrent live-host restore during cleanup
Status: RESOLVED

- Problem: while the canary archive was being created, an independent restore action (3434192169) ran against live droplet 601962983.
- Safety response: canary deletion was held.
- Restore completed at 2026-09-27T15:47:44Z.
- Verification: droplet 601962983 returned to active state before canary deletion proceeded.
