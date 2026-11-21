# Welsh Pilot Case Study Template — Fill In After Delivery

**Instructions:** Complete this template after pilot delivery. No invented numbers. Every claim must be evidenced. Quote requires written permission from council. "What went wrong" must be honest. Mark "N/A" where not applicable.

---

## Council Information

| Field | Value |
|-------|-------|
| Council name | [Council name] |
| Council type | [Principal council / County borough / City and county] |
| Welsh Language Standards compliance notice reference | [From Commissioner register] |
| Pilot lead (council) | [Name, role, department] |
| Chapelgate pilot lead | [Name, role] |

---

## Meeting Types Transcribed

| Meeting Type | Number of Meetings | Total Hours | Notes |
|--------------|-------------------|-------------|-------|
| Full Council | [#] | [hours] | [e.g. bilingual proceedings] |
| Cabinet / Executive | [#] | [hours] | |
| Scrutiny Committee(s) | [#] | [hours] | [list committees] |
| Planning Committee | [#] | [hours] | |
| Other committees | [#] | [hours] | [list] |
| **Total** | **[#]** | **[hours]** | |

---

## Accuracy Measured

| Metric | Value | Method | Evidence File |
|--------|-------|--------|---------------|
| WER (Word Error Rate) | [measured value] | chapelgate-multilingual-transcribe bench on pilot audio | [path to results JSON] |
| CER (Character Error Rate) | [measured value] | chapelgate-multilingual-transcribe bench on pilot audio | [path to results JSON] |
| Welsh-specific WER | [measured value] | Welsh-only segments | [path] |
| English-specific WER | [measured value] | English-only segments | [path] |
| Code-switch WER | [measured value] | Mixed-language segments | [path] |
| Bench gate passed? | [YES / NO / PARTIAL] | WER ≤ 0.25, CER ≤ 0.12 | [results JSON verdict] |

**Note:** If bench not run on pilot audio, write "NOT RUN — UNKNOWN".

---

## Officer Time Saved

| Activity | Manual Time (mins) | ASR-Assisted Time (mins) | Time Saved | Measured By |
|----------|-------------------|-------------------------|------------|-------------|
| Transcription review (per hour audio) | [mins] | [mins] | [mins] | Officer timesheet + review log |
| Draft transcript correction | [mins] | [mins] | [mins] | Officer timesheet + review log |
| Final sign-off | [mins] | [mins] | [mins] | Officer timesheet + review log |
| **Total per hour of audio** | **[mins]** | **[mins]** | **[mins]** | |

**Note:** Must be measured during pilot, not estimated. If not measured, write "NOT MEASURED".

---

## Council Quote

> "[Written quote from council officer with name, role, and written permission to use]"
> 
> — [Name], [Role], [Council]  
> **Permission granted:** [YES / NO — if NO, do not publish quote]  
> **Permission document:** [path to signed permission]

---

## What Went Wrong

| Issue | Impact | Resolution | Lesson |
|-------|--------|------------|--------|
| [e.g. specific Welsh dialect not recognised] | [e.g. WER 0.42 on those segments] | [e.g. added dialect adaptation; WER improved to 0.28] | [e.g. bench must include dialect samples] |
| [e.g. background noise in chamber] | [e.g. increased WER by 0.05] | [e.g. pre-filtering applied; marginal gain] | [e.g. chamber acoustics vary; test per venue] |
| [e.g. speaker overlap in debate] | [e.g. diarisation errors] | [e.g. manual correction needed] | [e.g. diarisation not reliable for fast overlap] |

**Be honest.** If nothing went wrong, write "NO SIGNIFICANT ISSUES IDENTIFIED".

---

## Next Step

| Option | Council Decision | Chapelgate Response |
|--------|-----------------|-------------------|
| Extend pilot to more meetings | [YES / NO / PENDING] | [If YES: scope, timeline, cost TBD] |
| Procure production service | [YES / NO / PENDING] | [If YES: G-Cloud / direct award route; price schedule TBD] |
| No further action | [YES / NO / PENDING] | Exit per pilot agreement; data returned/deleted |

---

## Metrics Mapping (fixed before first recording is sent)

| Pilot Metric | Case Study Field | Where Recorded |
|--------------|------------------|----------------|
| Turnaround (working hours, both sides timed) | Turnaround | out/METRICS-BASIS.md; bench results JSON |
| Officer edit rate — Welsh lines (%) | Officer edit rate (Welsh) | Line diff: Chapelgate draft vs council published |
| Officer edit rate — English lines (%) | Officer edit rate (English) | Line diff: Chapelgate draft vs council published |
| Run it again — yes/no + one-line reason | Run-again + reason | Council lead response at pilot end |
| Baseline — council's current process time for same meeting | Baseline comparison | Council-provided baseline (if shared) |

**Only published with the council's written opt-in.** If targets are missed, results are still reported honestly to the council and no public case study is made.

---

## Evidence Index (attach or link)

| Artefact | Path / Location |
|----------|-----------------|
| Pilot audio files (or reference) | [path] |
| Transcript outputs | [path] |
| Bench results JSON (with git_sha) | [path] |
| Officer timesheet / review logs | [path] |
| DPIA (council reviewed) | [path] |
| PentAGI report | [path] |
| Cyber Essentials self-assessment | [path] |
| Exit checklist (signed) | [path] |
| Council permission for quote | [path] |

---

**Completed by:** [Name, role]  
**Date:** [Date]  
**Version:** [1.0]