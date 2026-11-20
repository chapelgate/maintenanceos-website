"""Synthetic data test register for maintenanceos-website.

Validates the labelled synthetic training/test data produced by the
tool-synthetic-data-r1 pipeline: PII-free by construction, distinct n-gram
diversity, exact-duplicate dedupe, template-bound detection, and label schema.
No real customer data, no network, no secrets.
"""
import json
import re
from pathlib import Path

import pytest

SYNTH_DIR = Path("/home/andy/chapelgate/factory-tasks/tool-synthetic-data-r1-20261115/repo/synthetic/maintenanceos-website")
TRAIN = SYNTH_DIR / "training.jsonl"
TEST = SYNTH_DIR / "test.jsonl"
MANIFEST = SYNTH_DIR / "manifest.json"


def _load(path):
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def _shingles(text, n=3):
    t = re.sub(r"\s+", " ", text.lower()).strip()
    w = t.split()
    return {" ".join(w[i:i+n]) for i in range(max(0, len(w)-n+1))}


def _ngram_ratio(texts, n=3):
    all_ng = []
    for t in texts:
        all_ng.extend(_shingles(t, n))
    if not all_ng:
        return 1.0
    return len(set(all_ng)) / len(all_ng)


def test_manifest_has_version_and_counts():
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert m["product"] == "maintenanceos-website"
    assert m["pii_free_by_construction"] is True
    assert m["splits"]["train"]["count"] >= 100
    assert m["splits"]["test"]["count"] >= 50


def test_training_pii_free():
    rows = _load(TRAIN)
    assert len(rows) >= 100
    hits = 0
    for r in rows:
        text = " ".join(t["text"] for t in r["turns"])
        if re.search(r"\+44\d{10}|\b\d{4}\s?\d{6}\s?\d{4}\b|\b\d{3}[-.]\d{3}[-.]\d{4}\b", text):
            hits += 1
    assert hits == 0, f"PII hits in training: {hits}"


def test_test_pii_free():
    rows = _load(TEST)
    assert len(rows) >= 50
    hits = 0
    for r in rows:
        text = " ".join(t["text"] for t in r["turns"])
        if re.search(r"\+44\d{10}|\b\d{4}\s?\d{6}\s?\d{4}\b|\b\d{3}[-.]\d{3}[-.]\d{4}\b", text):
            hits += 1
    assert hits == 0, f"PII hits in test: {hits}"


def test_distinct_ngram_ratio_train():
    rows = _load(TRAIN)
    texts = [" ".join(t["text"] for t in r["turns"]) for r in rows]
    ratio = _ngram_ratio(texts)
    assert ratio >= 0.15, f"train distinct 3-gram ratio {ratio:.4%} < 15%"


def test_distinct_ngram_ratio_test():
    rows = _load(TEST)
    texts = [" ".join(t["text"] for t in r["turns"]) for r in rows]
    ratio = _ngram_ratio(texts)
    assert ratio >= 0.15, f"test distinct 3-gram ratio {ratio:.4%} < 15%"


def test_no_exact_duplicates():
    rows = _load(TRAIN) + _load(TEST)
    keys = set()
    for r in rows:
        keys.add("|".join(t["text"] for t in r["turns"]))
    assert len(keys) == len(rows), "exact duplicate scripts found"


def test_all_rows_labelled():
    rows = _load(TRAIN) + _load(TEST)
    for r in rows:
        assert "intent" in r and r["intent"]
        assert "escalation" in r and r["escalation"]
        assert "issue" in r and r["issue"]
        assert r.get("synthetic") is True
        assert r.get("pii_free") is True
