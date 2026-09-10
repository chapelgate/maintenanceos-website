"""
Offline pilot simulation.

This does not prove production safety. It stress-tests workflow mechanics and reports
how many synthetic jobs require human review versus routine flow.
"""
import tempfile,os,random,json
from decision_engine import classify

ROUTINE=[
 "The kitchen tap is dripping.",
 "One radiator is cold.",
 "The washing machine has stopped spinning.",
 "The front door lock is stiff but still secures.",
 "There is mould around the bathroom window.",
]
URGENT=[
 "We have no heating.",
 "There is no hot water.",
 "Water is leaking through the kitchen ceiling.",
 "The front door cannot lock.",
]
RED=[
 "I can smell gas near the boiler.",
 "The socket is sparking.",
 "Water is pouring through the ceiling.",
 "The carbon monoxide alarm is sounding.",
 "The ceiling collapsed.",
 "My child is trapped behind the locked door.",
]

def run(n=1000,seed=42):
    random.seed(seed)
    stats={"P1":0,"P2":0,"P3":0,"human_review":0,"red_missed":0}
    for _ in range(n):
        group=random.choices(["routine","urgent","red"],weights=[70,20,10])[0]
        text=random.choice({"routine":ROUTINE,"urgent":URGENT,"red":RED}[group])
        r=classify(text)
        stats[r["urgency"]]=stats.get(r["urgency"],0)+1
        stats["human_review"]+=int(r["human_review_required"])
        if group=="red" and (r["urgency"]!="P1" or not r["safety_flags"]):
            stats["red_missed"]+=1
    return stats

if __name__=="__main__":
    print(json.dumps(run(),indent=2))
