import json
from pathlib import Path
from decision_engine import classify
CASES=json.loads((Path(__file__).parent/"red_team_corpus.json").read_text())
def test_red_corpus():
    bad=[]
    for c in CASES:
        r=classify(c["text"])
        if c["red"] and (r["urgency"]!="P1" or not r["safety_flags"] or not r["human_review_required"]):
            bad.append((c["id"],r))
    assert not bad,bad[:10]
