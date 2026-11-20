# Welsh Pilot Proposal — Chapelgate Multilingual Transcribe (One Page)

**For:** One Welsh principal council  
**Product:** Chapelgate Multilingual Transcribe (Welsh/English committee and full-council meeting transcription)  
**Opening offer:** Try one meeting free — one recorded public meeting transcribed, no cost, no obligation to buy (see TRIAL-TERMS-TEMPLATE.md).  
**Step two:** Free 6-week pilot (2–3 meetings) after the one-meeting trial.  
**Wedge:** Welsh Language Standards apply to all 22 Welsh principal councils — bilingual meeting transcription is a Service Delivery Standard obligation. Chapelgate has native Welsh/English ASR with bench evidence; competitors have no Welsh ASR evidence.  
**Contact route:** Democratic services / Welsh language officer generic email (sourced from each council website; see TARGETS.md) — DRAFT only, no contact made.

## Problem

Welsh councils must produce bilingual meeting records under the Welsh Language Standards (Welsh Language (Wales) Measure 2011; Compliance Notices issued to all 22 principal councils, Welsh Language Commissioner register). Democratic services officers spend hours manually transcribing bilingual meetings. No competitor offers native Welsh/English ASR for council meetings.

## What we do

Chapelgate Multilingual Transcribe transcribes Welsh/English public council meeting recordings into a bilingual draft transcript for officers to check. Local CPU inference — no paid API, no model training, no production tenancy integration.

## Trial — try one meeting free

One recorded public meeting (already on your webcast or council-supplied non-sensitive recording) is transcribed into a bilingual Welsh/English draft transcript for officer review. No accuracy guarantee. Free, no obligation to buy. Terms: TRIAL-TERMS-TEMPLATE.md (TEMPLATE — NOT SIGNED — for council legal review).

## 6-Week Pilot Plan (step two after the trial)

| Week | Activity |
|------|----------|
| 1 | Kick-off, confirm scope (2–3 public webcast recordings already on council webcast), provision isolated local instance |
| 2 | Deploy Chapelgate Multilingual Transcribe; share runbook and access with council pilot lead |
| 3 | Transcribe council-supplied non-sensitive / synthetic recordings; measure WER vs bench gate |
| 4 | Officer review of draft transcripts; measure officer time saved (manual vs ASR-assisted review) |
| 5 | Compliance review: DPIA draft, Cyber Essentials self-assessment artefacts, model card, SBOM; PentAGI red-team run |
| 6 | Exit: final report (WER/CER measured, officer time saved measured), data return/deletion per DPIA, access revoked |

## What the council gives

- 2–3 public meeting recordings already on their webcast (non-sensitive; council-supplied or synthetic if council prefers)
- One named pilot lead to validate outputs against expected results
- Feedback on draft transcripts and time-saved measurement

## Success Measures (measured, not promised)

| Measure | Gate / Target | Evidence |
|---------|---------------|----------|
| Transcription accuracy | WER ≤ 0.25, CER ≤ 0.12 on Welsh/English test audio | chapelgate-multilingual-transcribe bench results (results JSON with git_sha + verdict) |
| Officer time saved | Measured by comparing manual vs ASR-assisted review time per recording | Officer timesheet + review log |
| Accuracy limits honest | WER/CER reported exactly as measured; UNKNOWN if not run | Bench score-dev WER 0.1894, CER 0.0817 (frozen40/dev40 mix, 2026-11-16) |
| Security | 0 Critical/High PentAGI findings; Cyber Essentials GAPs documented | PentAGI report; CE self-assessment draft |

## Data Protection

- No personal data beyond public webcasts (council meetings already public)
- DPIA draft provided for council review
- UK data residency: local CPU instance, no data leaves UK
- Council-provided audio returned/deleted per written instruction within 5 working days
- Chapelgate deletes all pilot data on council request

## Cost

**Free 6-week pilot.** Synthetic or council-supplied non-sensitive recordings only. No licence fees. No paid follow-on price offered in this pack — any paid follow-on is parked to PARKED.md.

## Exit

Council keeps transcripts produced during pilot. Chapelgate deletes all pilot data on request. Access revoked within 1 working day of pilot end. Exit checklist signed by both parties.

## How we'll measure success

The three metrics below are fixed in writing before the first recording is sent:

**1. Turnaround.** Working hours from recording received to transcript draft returned, timed by both sides. The target is set at kickoff from the Dell bench timings for that recording length (bench basis recorded in out/METRICS-BASIS.md). Never quote a number the bench has not produced.

**2. Officer edit rate.** The percentage of transcript lines an officer changes before publishing, measured by a line diff between Chapelgate's draft and the council's published version (computed and shared by Chapelgate). Report Welsh and English lines separately. The target is set at kickoff and stated as a percentage.

**3. Run it again.** One yes/no question to the council lead at the end: "Would you run this again on your next meeting?" with an optional one-line reason.

**Baseline:** how long the council's current process takes for the same meeting, if the council will share it.

Each metric maps directly to a field in the Case Study Template (turnaround, edit rate, run-again plus the reason, baseline comparison). A case study is only published with the council's written opt-in. If the targets are missed, the results are still reported honestly to the council, and no public case study is made.

---

**Sources:** Welsh Language Standards (out/research-welsh-language-standards.md); council webcasting & contacts (out/research-council-targets.md); ONE-PAGER.md (competitor Welsh language); mlt-offline-speech-weights-20261116 bench evidence. No contact made with any council. No invented figures.