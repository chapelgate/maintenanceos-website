import json
import re
from datetime import datetime
from clock import utcnow
from models import SessionLocal, WorkOrder, Approval, Escalation, AuditEvent, Contractor, Client
from lifecycle import transition_work_order
from lifecycle_rules import transition_allowed
from safety_controls import enforce_latched_state, latch_critical_safety
from escalation_text import bounded_escalation_reason
from approval_text import bounded_proposed_action
from escalation_text import bounded_escalation_reason

RED_RULES=[
 ("GAS_SMELL",["smell gas","smell of gas","gas smell","gas leak","smells of gas","gas fumes"],"Suspected gas escape"),
 ("ACTIVE_FIRE",["on fire","flames","house is burning","flat is burning","active fire","smoke coming from","smoke filling","smoke is filling","can see smoke","room is full of smoke"],"Possible active fire or smoke"),
 ("CO",["carbon monoxide","co alarm","co detector","headache and dizziness","dizzy and have a headache"],"Carbon monoxide concern"),
 ("ELECTRICAL",["sparking socket","socket is sparking","socket sparking","sparks from the socket","sparks from socket","live wire","exposed wire","electric shock","burning socket","electrical arcing","water on the electrics","water near the socket","water through the light fitting","water is pouring through the light fitting","water and electricity"],"Electrical danger"),
 ("FLOOD",["water pouring","water is pouring","burst pipe","water everywhere","flooding badly","major flood","ceiling is flooding","flooding through the ceiling"],"Uncontrolled water escape"),
 ("STRUCTURAL",["ceiling collapsed","wall collapsed","ceiling fell","structural collapse","ceiling is sagging","sagging ceiling"],"Structural danger"),
 ("ENTRAPMENT",["child trapped","child is trapped","baby trapped","baby is trapped","person trapped","someone is trapped","trapped inside","child locked","child is locked","baby locked","baby is locked","child locked inside","baby locked inside"],"Entrapment / safeguarding")
]

RED_PATTERNS = {
    "GAS_SMELL": [
        r"\b(?:smell|smells|smelling|odou?r|fumes?)\b.{0,30}\bgas\b",
        r"\bgas\b.{0,30}\b(?:smell|odou?r|fumes?|leak(?:ing)?|hiss(?:ing)?)\b",
        r"\bsuspect(?:ed)?\b.{0,20}\bgas\b.{0,20}\b(?:escape|leak)\b",
    ],
    "ACTIVE_FIRE": [
        r"\b(?:flames?|active fire|on fire|caught fire|burning)\b",
        r"\bsmoke\b.{0,40}\b(?:room|flat|house|home|ceiling|stairs?|hall|kitchen|bedroom|coming|filling|thick)\b",
        r"\b(?:room|flat|house|home|ceiling|stairs?|hall|kitchen|bedroom)\b.{0,40}\bsmoke\b",
    ],
    "CO": [
        r"\bcarbon\s*monoxide\b",
        r"\bco\s+(?:alarm|detector)\b",
        r"\b(?:headache|dizzy|dizziness|nausea)\b.{0,45}\b(?:boiler|heater|gas appliance)\b",
    ],
    "ELECTRICAL": [
        r"\b(?:spark(?:s|ing)?|arcing|electric shock|electrocut(?:ed|ion)|live (?:wire|cable)|exposed (?:wire|cable)|burning socket|smoking socket)\b",
        r"\b(?:wire|cable|socket|fuse box|consumer unit|light fitting)\b.{0,25}\b(?:live|exposed|sparking|arcing|burning|smoking)\b",
    ],
    "FLOOD": [
        r"\b(?:major|severe|uncontrolled)\b.{0,20}\b(?:flood|flooding|leak|water)\b",
        r"\b(?:water|pipe)\b.{0,35}\b(?:gushing|pouring|everywhere|ankle[- ]deep|cannot stop|can't stop)\b",
        r"\b(?:burst|split)\s+(?:water\s+)?pipe\b",
    ],
    "STRUCTURAL": [
        r"\b(?:ceiling|wall|roof|floor|building)\b.{0,35}\b(?:collaps(?:e|ed|ing)|falling|fell|sagging|bowing|unstable)\b",
        r"\b(?:serious|large|widening|moving)\b.{0,20}\bcrack\b",
        r"\bstructural\b.{0,25}\b(?:danger|unsafe|failure|collapse)\b",
    ],
    "ENTRAPMENT": [
        r"\b(?:child|baby|person|someone|resident|tenant|I|we)\b.{0,35}\b(?:trapped|locked (?:in|inside)|cannot get out|can't get out)\b",
        r"\b(?:trapped|locked (?:in|inside))\b.{0,35}\b(?:child|baby|person|someone|resident|tenant)\b",
    ],
}

WATER_ELECTRIC = (
    re.compile(r"\b(?:water|leak(?:ing)?|flood(?:ing)?)\b", re.IGNORECASE),
    re.compile(r"\b(?:electric(?:ity|al|s)?|socket|wire|cable|fuse box|consumer unit|light fitting|appliance)\b", re.IGNORECASE),
)

HUMAN_ESCALATION_RULES=[
 ("SAFEGUARDING",["safeguarding","child at risk","vulnerable child","vulnerable person","domestic abuse","being abused"],"RED","Safeguarding concern"),
 ("THREAT",["threatening me","threatened me","violence","violent","weapon","harassment"],"RED","Threat or violence concern"),
 ("LEGAL",["solicitor","lawyer","court action","legal dispute"],"AMBER","Legal matter"),
 ("COMPLAINT",["complaint","complain about"],"AMBER","Complaint requiring human review"),
]

CATEGORIES={
 "Plumbing":["water","leak","pipe","tap","toilet","sink","bath","overflow"],
 "Heating":["boiler","heating","radiator","hot water","thermostat"],
 "Electrical":["socket","electric","wire","power","fuse","light"],
 "Drainage":["drain","blocked drain","sewer","gully"],
 "Roofing":["roof","tile","gutter"],
 "Locks / access":["lock","key","locked out","gate"],
 "Doors":["door","hinge","door frame"],
 "Windows":["window","glass"],
 "Appliances":["oven","fridge","washing machine","dryer","dishwasher"],
 "Damp / mould":["damp","mould","mold","condensation"],
 "Pests":["rat","mouse","mice","wasp","cockroach"],
 "Structural":["collapse","subsidence","large crack","wall moving"],
 "Fire safety":["smoke alarm","fire alarm","fire door","carbon monoxide"],
 "General maintenance":["repair","broken","damage"]
}
TRADE={
 "Plumbing":"Plumber","Heating":"Heating Engineer","Electrical":"Electrician","Drainage":"Drainage",
 "Roofing":"Roofer","Locks / access":"Locksmith","Doors":"Joiner","Windows":"Glazier",
 "Appliances":"Appliance Engineer","Damp / mould":"Damp Specialist","Pests":"Pest Control",
 "Structural":"Builder","Fire safety":"Fire Safety","General maintenance":"Handyperson","Unknown":"General"
}
URGENCIES=frozenset({"P1","P2","P3"})

def safety_flags(text):
    t=text.lower() if isinstance(text,str) else ""
    descriptions={code:description for code,_terms,description in RED_RULES}
    codes={code for code,terms,_description in RED_RULES if any(term in t for term in terms)}
    for code,patterns in RED_PATTERNS.items():
        if any(re.search(pattern,t,re.IGNORECASE) for pattern in patterns):
            codes.add(code)
    if WATER_ELECTRIC[0].search(t) and WATER_ELECTRIC[1].search(t):
        codes.add("ELECTRICAL")
    return [
        {"code":code,"level":"RED","description":descriptions[code]}
        for code in descriptions if code in codes
    ]

def human_escalation_flags(text):
    t=text.lower() if isinstance(text,str) else ""
    return [{"code":c,"level":level,"description":d} for c,terms,level,d in HUMAN_ESCALATION_RULES if any(x in t for x in terms)]

def classify(text):
    t=text.lower() if isinstance(text,str) else ""
    flags=safety_flags(text)
    human_flags=human_escalation_flags(text)
    scores={c:sum(1 for kw in kws if kw in t) for c,kws in CATEGORIES.items()}
    category=max(scores,key=scores.get) if scores and max(scores.values())>0 else "Unknown"
    confidence=.45 if category=="Unknown" else min(.98,.62+.08*scores[category])
    if flags: urgency="P1"
    elif any(x in t for x in ["no heating","no hot water","cannot lock","can't lock","water through ceiling","leaking through ceiling"]): urgency="P2"
    else: urgency="P3"
    if urgency not in URGENCIES:
        raise ValueError("urgency is not allowed")
    return {"category":category,"trade":TRADE.get(category,"General"),"urgency":urgency,
            "confidence":round(confidence,2),"safety_flags":flags,
            "human_escalation_flags":human_flags,
            "human_review_required":bool(flags or human_flags or category=="Unknown")}

def work_order_allows_dispatch(work_order):
    if not work_order or work_order.status!="READY_FOR_DISPATCH":
        return False
    try:
        flags=json.loads(work_order.safety_flags or "[]")
    except (TypeError,json.JSONDecodeError):
        return False
    return not flags and work_order.category!="Unknown" and work_order.ai_confidence>=.5

def contractor_rank(contractors,trade,postcode):
    eligible=[c for c in contractors if c.active and c.trade==trade]
    def score(c):
        coverage=5 if postcode[:4] in (c.postcode_coverage or "") or postcode[:3] in (c.postcode_coverage or "") else 0
        return coverage + c.rating + 2*c.acceptance_rate + 2*c.first_time_fix_rate - min(c.avg_response_minutes/120,2)
    return sorted(eligible,key=score,reverse=True)

def apply_intake_rules(work_order_id):
    with SessionLocal() as s:
        wo=s.query(WorkOrder).filter_by(id=work_order_id).first()
        if not wo:return
        try:
            prior_safety_flags=json.loads(wo.safety_flags or "[]")
        except (TypeError,json.JSONDecodeError):
            prior_safety_flags=[{"code":"INVALID_SAFETY_STATE","level":"RED"}]
        result=classify(wo.description)
        wo.category=result["category"];wo.trade=result["trade"]
        wo.ai_confidence=result["confidence"];wo.updated_at=utcnow()
        if result["safety_flags"] or prior_safety_flags:
            latch_critical_safety(s,wo,prior_safety_flags+result["safety_flags"],"Decision Engine")
            if not s.query(Escalation).filter_by(work_order_id=wo.id,level="RED",status="OPEN").first():
                s.add(Escalation(work_order_id=wo.id,level="RED",reason=bounded_escalation_reason(json.dumps(result["safety_flags"]))))
            if not s.query(Approval).filter_by(work_order_id=wo.id,approval_type="SAFETY",status="PENDING").first():
                s.add(Approval(client_id=wo.client_id,work_order_id=wo.id,approval_type="SAFETY",
                               proposed_action=bounded_proposed_action("Human safety review"),reason=json.dumps(result["safety_flags"])))
        elif enforce_latched_state(s,wo):
            pass
        elif result["human_escalation_flags"]:
            level="RED" if any(x["level"]=="RED" for x in result["human_escalation_flags"]) else "AMBER"
            if level=="RED":
                latch_critical_safety(s,wo,result["human_escalation_flags"],"Deterministic Human Safety Gate")
            else:
                wo.safety_flags="[]";wo.urgency=result["urgency"]
                transition_work_order(s,wo,"HUMAN_REVIEW",actor="Decision Engine",reason="Deterministic human escalation")
            if not s.query(Escalation).filter_by(work_order_id=wo.id,level=level,status="OPEN").first():
                s.add(Escalation(work_order_id=wo.id,level=level,reason=bounded_escalation_reason(json.dumps(result["human_escalation_flags"]))))
            if not s.query(Approval).filter_by(work_order_id=wo.id,approval_type="HUMAN_ESCALATION",status="PENDING").first():
                s.add(Approval(client_id=wo.client_id,work_order_id=wo.id,approval_type="HUMAN_ESCALATION",
                               proposed_action=bounded_proposed_action("Human review required"),reason=json.dumps(result["human_escalation_flags"])))
        elif result["human_review_required"]:
            wo.safety_flags="[]";wo.urgency=result["urgency"]
            transition_work_order(s,wo,"HUMAN_REVIEW",actor="Decision Engine",reason="Uncertain classification")
            if not s.query(Approval).filter_by(work_order_id=wo.id,approval_type="TRIAGE",status="PENDING").first():
                s.add(Approval(client_id=wo.client_id,work_order_id=wo.id,approval_type="TRIAGE",
                               proposed_action=bounded_proposed_action("Review uncertain classification"),reason="Low-confidence or unknown category"))
        else:
            wo.safety_flags="[]";wo.urgency=result["urgency"]
            blocking=s.query(Approval).filter(
                Approval.work_order_id==wo.id,
                Approval.status=="PENDING",
                Approval.approval_type.in_(["SAFETY","POST_SAFETY_CLEARANCE","IDENTITY","HUMAN_ESCALATION"]),
            ).first()
            transition_work_order(
                s,wo,"HUMAN_REVIEW" if blocking else "READY_FOR_DISPATCH",
                actor="Decision Engine",reason="Blocking human hold" if blocking else "Routine intake complete",
            )
        s.add(AuditEvent(work_order_id=wo.id,actor="Decision Engine",event="INTAKE_CLASSIFIED",detail=json.dumps(result)))
        s.commit()
