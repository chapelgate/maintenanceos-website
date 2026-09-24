#!/usr/bin/env python3
"""Fail-closed integrity verifier for the pinned MaintenanceOS voice candidate.

Read-only: it never downloads, installs, restarts, or mutates services.
Use --evidence-dir when sovereign evidence is available locally.
"""
import argparse, hashlib, json, os, sys
from pathlib import Path

EXPECTED = {
    "voice_id": "CG-VOICE-0004",
    "voice_version": "CG-VOICE-0004-v1",
    "speaker": "bf_alice",
    "model": "kokoro-82m",
    "speed": 0.93,
    "lang_code": "b",
    "kokoro_image": "ghcr.io/remsky/kokoro-fastapi-cpu:v0.9.0@sha256:7f9a256919eff7a84e9a77b757de0f3fe95c48fcf4fbe1e008deacbc7d9f2985",
    "asr_model": "Systran/faster-whisper-tiny.en",
    "silero_sha256": "1a153a22f4509e292a94e67d6f9b85e8deb25b4988682b7e174c65279d8788e3",
    "smart_turn_sha256": "2bb026316b14a660486a75b1733cd3fbab8c2fd0314dc9af7be49f8cca967e4f",
}

def sha256(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()

def load(path):
    with open(path,encoding="utf-8") as f: return json.load(f)

def check(name, actual, expected, out):
    ok=actual==expected
    out.append({"check":name,"ok":ok,"expected":expected,"actual":actual})
    return ok

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--evidence-dir", default="docs/sovereign-voice")
    ap.add_argument("--silero")
    ap.add_argument("--smart-turn")
    ap.add_argument("--json", action="store_true")
    a=ap.parse_args()
    d=Path(a.evidence_dir)
    results=[]

    preserve=d/"HUMAN_ENGINE_PRESERVE.json"
    spectre=d/"SPECTRE_HUMAN_ENGINE.json"
    if not preserve.exists() or not spectre.exists():
        print("FAIL: required pin evidence missing", file=sys.stderr); return 2

    p=load(preserve); s=load(spectre)
    checks=[
      check("voice_id",p.get("selected_voice_id"),EXPECTED["voice_id"],results),
      check("voice_version",p.get("version"),EXPECTED["voice_version"],results),
      check("speaker",p.get("speaker"),EXPECTED["speaker"],results),
      check("model",p.get("model"),EXPECTED["model"],results),
      check("speed",p.get("speed"),EXPECTED["speed"],results),
      check("lang_code",p.get("lang_code"),EXPECTED["lang_code"],results),
      check("kokoro_image",s.get("pins",{}).get("kokoro_image"),EXPECTED["kokoro_image"],results),
    ]
    speaches=s.get("pins",{}).get("speaches","")
    checks.append(check("asr_model_present",EXPECTED["asr_model"] in speaches,True,results))
    checks.append(check("silero_evidence_pin",s.get("pins",{}).get("silero_vad"),"sha256:"+EXPECTED["silero_sha256"],results))
    checks.append(check("smart_turn_evidence_pin",s.get("pins",{}).get("smart_turn"),"sha256:"+EXPECTED["smart_turn_sha256"],results))

    for label,path,expected in [
      ("silero_runtime_sha256",a.silero,EXPECTED["silero_sha256"]),
      ("smart_turn_runtime_sha256",a.smart_turn,EXPECTED["smart_turn_sha256"]),
    ]:
        if path:
            if not os.path.isfile(path):
                checks.append(check(label,"MISSING",expected,results))
            else:
                checks.append(check(label,sha256(path),expected,results))

    ok=all(checks)
    report={"ok":ok,"fail_closed":True,"expected":EXPECTED,"checks":results}
    print(json.dumps(report,indent=2) if a.json else ("PASS: pinned candidate integrity verified" if ok else "FAIL: candidate drift detected"))
    return 0 if ok else 1

if __name__=="__main__": raise SystemExit(main())
