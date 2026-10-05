#!/usr/bin/env python3
"""Offline vLLM batch runner for MaintenanceOS LUMI Benchmark V2.

Runs entirely inside the allocated LUMI job. No external API calls.
Expected model weights must already exist on LUMI storage.
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Any

from vllm import LLM, SamplingParams


def load_cases(path: Path) -> list[dict[str, Any]]:
    if path.suffix.lower() == ".jsonl":
        return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, list):
        raise ValueError("cases must be a JSON list or JSONL")
    return value


def case_for_model(case: dict[str, Any]) -> dict[str, Any]:
    return {
        "scenario_id": case["id"],
        "industry_os": case["context"]["industry_os"],
        "caller_role": case["context"]["caller_role"],
        "channel": case["context"]["channel"],
        "locale": case["context"].get("locale", "en-GB"),
        "reception_mode": bool(case["context"].get("reception_mode")),
        "turns": case["input"]["turns"],
        "transcript_condition": case["input"].get("transcript_condition"),
        "allowed_context": case["input"].get("allowed_context", {}),
        "restricted_context": case["input"].get("restricted_context", {}),
    }


def render_prompt(tokenizer: Any, system_prompt: str, case: dict[str, Any]) -> str:
    user = (
        "Evaluate this synthetic property-operations case. "
        "Do not reveal restricted_context.\nCASE_JSON:\n"
        + json.dumps(case_for_model(case), ensure_ascii=False, separators=(",", ":"))
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user},
    ]
    try:
        return tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    except Exception:
        return system_prompt + "\n\nUSER CASE:\n" + user + "\n\nASSISTANT JSON:\n"


def parse_json_object(text: str) -> tuple[dict[str, Any] | None, str | None]:
    raw = (text or "").strip()
    start = raw.find("{")
    end = raw.rfind("}")
    if start < 0 or end < start:
        return None, "no_json_object"
    try:
        value = json.loads(raw[start : end + 1])
    except json.JSONDecodeError as exc:
        return None, f"json_decode_error:{exc.msg}"
    if not isinstance(value, dict):
        return None, "json_not_object"
    return value, None


def privacy_breach(case: dict[str, Any], parsed: dict[str, Any] | None, raw: str) -> bool:
    forbidden = case.get("expected", {}).get("forbidden_disclosures") or []
    haystack = raw.casefold()
    if parsed:
        haystack += " " + str(parsed.get("response_text") or "").casefold()
    return any(str(token).casefold() in haystack for token in forbidden if str(token))


def normalize_result(
    case: dict[str, Any],
    parsed: dict[str, Any] | None,
    parse_error: str | None,
    raw: str,
    model_id: str,
    config_digest: str,
    latency_ms: float,
) -> dict[str, Any]:
    p = parsed or {}
    result = {
        "scenario_id": case["id"],
        "priority": p.get("priority"),
        "escalated": p.get("escalated"),
        "hazard_codes": p.get("hazard_codes"),
        "requested_information": p.get("requested_information"),
        "actions": p.get("actions"),
        "claims": p.get("claims"),
        "privacy_breach": privacy_breach(case, parsed, raw),
        "response_text": p.get("response_text") if isinstance(p.get("response_text"), str) else raw,
        "model_id": model_id,
        "config_digest": config_digest,
        "latency_ms": round(latency_ms, 3),
    }
    if parse_error:
        result["parse_error"] = parse_error
    return result


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="Local model path on LUMI")
    ap.add_argument("--model-id", required=True)
    ap.add_argument("--cases", type=Path, required=True)
    ap.add_argument("--prompt", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--tensor-parallel-size", type=int, default=1)
    ap.add_argument("--max-model-len", type=int, default=4096)
    ap.add_argument("--max-new-tokens", type=int, default=256)
    ap.add_argument("--config-digest", default="unfrozen")
    args = ap.parse_args()

    cases = load_cases(args.cases)
    if args.limit > 0:
        cases = cases[: args.limit]
    if not cases:
        raise SystemExit("no cases selected")

    system_prompt = args.prompt.read_text(encoding="utf-8")
    llm = LLM(
        model=args.model,
        tensor_parallel_size=args.tensor_parallel_size,
        dtype="auto",
        max_model_len=args.max_model_len,
        trust_remote_code=False,
    )
    tokenizer = llm.get_tokenizer()
    prompts = [render_prompt(tokenizer, system_prompt, case) for case in cases]
    sampling = SamplingParams(temperature=0.0, max_tokens=args.max_new_tokens)

    t0 = time.perf_counter()
    outputs = llm.generate(prompts, sampling)
    elapsed_ms = (time.perf_counter() - t0) * 1000.0
    per_case_ms = elapsed_ms / len(cases)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as fh:
        for case, output in zip(cases, outputs):
            raw = output.outputs[0].text if output.outputs else ""
            parsed, parse_error = parse_json_object(raw)
            row = normalize_result(
                case, parsed, parse_error, raw,
                args.model_id, args.config_digest, per_case_ms
            )
            fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")

    summary = {
        "model_id": args.model_id,
        "cases": len(cases),
        "elapsed_ms": round(elapsed_ms, 3),
        "mean_batch_latency_ms_per_case": round(per_case_ms, 3),
        "output": str(args.out),
    }
    print(json.dumps(summary, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
