# Daily council: Dell root disk keep / bin review (standing order, Andy voice 15 Nov 2026 22:05 GMT)
REPORT ONLY. Do NOT delete, move, archive, prune or change config. Read-only measuring only.
STRICT RULE (Andy): keep only ABSOLUTELY ESSENTIAL stuff that will be needed; everything else gets binned (DELETE verdict).
- KEEP only if a running unit (systemctl --user, dell-services/overnight-keepalive/jobs.tsv), a live product, a statutory/legal record, or an irreplaceable source with no other copy needs it - name exactly what.
- ARCHIVE TO D only if essential-but-cold and it fits /mnt/d free space.
- Otherwise DELETE. Legal/statutory records are parked in jobs-work-dell/readiness/PARKED.md, never binned.
Scope: measure df for / and /mnt/d, then the top consumers on root (du -x of /home/andy/chapelgate/*, migration-staging/*, factory-tasks/* finished vs running, jobs-work-dell/*, /tmp/*, ~/.local/share/opencode, ~/.cache/*, docker system df, golden-line-stt-bench, hcv-source-readonly, and anything new >1G or growing since yesterday's report in dell-services/disk-council-daily/reports/).
Council: at least 3 independent reviewer passes (necessity, risk/recoverability, estate rules), each verdict with evidence.
Hard limits: never production omniroute container/image/volumes (127.0.0.1:20128), golden voice line, secrets, LUMI private eval set, the running local-dell-llama model.
- **scanners: installed binaries (~/.local/bin) or pinned docker images only, never npx**
Outputs: out/VERDICTS.md (item | size | verdict | reason | evidence | root freed), out/PLAN.md (ordered plan, not executed, resulting root %), out/RESULT.md >=300 bytes with council GO. Copy VERDICTS.md to dell-services/disk-council-daily/reports/DATE-VERDICTS.md. Append a 3-line summary to jobs-work-dell/ANDY-BRIEFING.md (append only, outside CALL markers). MISSION_COMPLETE only after council GO.

D DRIVE (added 16 Nov 2026, Andy voice cf641879): D is at 95% and disk-mover/disk-guard now stop when D has under 75G free. Each daily run also writes out/D-PLAN.md: the biggest D folders, which ones are proven duplicates (checksum or file-count match against another copy), and a ranked bin list with exact paths and sizes, so Andy can sign off in one line. Report only: no deletes or moves on D until sign-off is recorded in PARKED.md.
