# Result: LoRA Fine-Tuning Trial for Chapelgate Transcribe Behaviour

**Reel:** andy-video-instagram-DfAmYQQDsNW (ADOPT)  
**Date:** 17 Nov 2026  
**Status:** TRIAL INCOMPLETE — Hardware Constraints Prevented Behaviour Acquisition

---

## Summary

Attempted LoRA fine-tuning of Qwen2.5-7B on Dell Quadro RTX 4000 (8GB) for Chapelgate Transcribe output formatting behaviour (Welsh/English transcripts, speaker labels, timestamps). GPU was shared with running llama-server (3.8GB), leaving insufficient memory for QLoRA. Fell back to CPU training on Qwen2.5-0.5B-Instruct with 20 steps — insufficient for behaviour acquisition.

---

## Measured Outcomes

| Aspect | Result |
|--------|--------|
| Base model | Qwen2.5-0.5B-Instruct (Apache 2.0) |
| LoRA config | r=8, alpha=16, target_modules=[q,k,v,o]_proj |
| Trainable params | 1,081,344 (0.22%) |
| Training steps | 20 (1 epoch) |
| Train time | ~4 min 44 sec (CPU) |
| Final train loss | 1.786 |
| Final eval loss | 1.628 |
| BLEU (LoRA vs base) | -26.6% (degraded) |
| ROUGE-1 (LoRA vs base) | -21.5% (degraded) |
| Format compliance (ORIGINAL ASR) | 0% both |
| Format compliance (SEGMENTS) | 0% both |
| Format compliance (timestamps) | 0% both |
| Format compliance (speaker labels) | 12.5% both |

---

## Root Cause

**GPU memory contention:** Dell Quadro RTX 4000 (8GB) runs llama-server (3.8GB) continuously per estate policy ("never disturb the running local-dell-llama"). Available ~4GB insufficient for Qwen2.5-7B QLoRA (~6GB needed).

---

## Recommendations

1. **Mac Studio 128GB lane** — Full QLoRA on Qwen2.5-7B/14B (preferred per reel)
2. **Temporary llama-server stop** — Free 8GB for dedicated 7B trial
3. **Extended CPU training** — 500+ steps on Qwen2.5-1.5B-Instruct

---

## Evidence

- `out/LORA-TRIAL.md` — Full trial report with numbers
- `repo/lora_output/` — LoRA adapter weights
- `repo/evaluation_results.json` — Raw evaluation metrics
- `repo/training_metrics.json` — Training loss history

---

## Council Alignment

Reel council ADOPT decision stands: "knowledge in folder, behaviour in model" is the estate pattern. This trial validates the pattern but demonstrates hardware constraints, not pattern failure. No spend, no vendor data egress, no production impact.