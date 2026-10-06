"""Dependency-free frozen policy adapter for LUMI Benchmark V2.

This mirrors only the pure deterministic classification/output-claim logic needed
by the offline benchmark. Repository tests compare it against the canonical
decision_engine and voice_policy on the frozen SUT before LUMI execution.
"""

from __future__ import annotations
import re

RED_RULES=[
 ("GAS_SMELL",["smell gas","smell of gas","gas smell","gas leak","smells of gas","gas fumes"],"Suspected gas escape"),
 ("ACTIVE_FIRE",["on fire","flames","house is burning","flat is burning","active fire","smoke coming from","smoke filling","smoke is filling","can see smoke","room is full of smoke"],"Possible active fire or smoke"),
 ("CO",["carbon monoxide","co alarm","co detector","headache and dizziness","dizzy and have a headache"],"Carbon monoxide concern"),
 ("ELECTRICAL",["sparking socket","socket is sparking","socket sparking","sparks from the socket","sparks from socket","live wire","exposed wire","electric shock","burning socket","electrical arcing","water on the electrics","water near the socket","water through the light fitting","water is pouring through the light fitting","water and electricity"],"Electrical danger"),
 ("FLOOD",["water pouring","water is pouring","burst pipe","water everywhere","flooding badly","major flood","ceiling is flooding","flooding through the ceiling"],"Uncontrolled water escape"),
 ("STRUCTURAL",["ceiling collapsed","wall collapsed","ceiling fell","structural collapse","ceiling is sagging","sagging ceiling"],"Structural danger"),
 ("ENTRAPMENT",["child trapped","child is trapped","baby trapped","baby is trapped","person trapped","someone is trapped","trapped inside","child locked","child is locked","baby locked","baby is locked","child locked inside","baby locked inside"],"Entrapment / safeguarding")
]
RED_PATTERNS={
 "GAS_SMELL":[r"\b(?:smell|smells|smelling|odou?r|fumes?)\b.{0,30}\bgas\b",r"\bgas\b.{0,30}\b(?:smell|odou?r|fumes?|leak(?:ing)?|hiss(?:ing)?)\b",r"\bsuspect(?:ed)?\b.{0,20}\bgas\b.{0,20}\b(?:escape|leak)\b"],
 "ACTIVE_FIRE":[r"\b(?:flames?|active fire|on fire|caught fire|burning)\b",r"\bsmoke\b.{0,40}\b(?:room|flat|house|home|ceiling|stairs?|hall|kitchen|bedroom|coming|filling|thick)\b",r"\b(?:room|flat|house|home|ceiling|stairs?|hall|kitchen|bedroom)\b.{0,40}\bsmoke\b"],
 "CO":[r"\bcarbon\s*monoxide\b",r"\bco\s+(?:alarm|detector)\b",r"\b(?:headache|dizzy|dizziness|nausea)\b.{0,45}\b(?:boiler|heater|gas appliance)\b"],
 "ELECTRICAL":[r"\b(?:spark(?:s|ing)?|arcing|electric shock|electrocut(?:ed|ion)|live (?:wire|cable)|exposed (?:wire|cable)|burning socket|smoking socket)\b",r"\b(?:wire|cable|socket|fuse box|consumer unit|light fitting)\b.{0,25}\b(?:live|exposed|sparking|arcing|burning|smoking)\b"],
 "FLOOD":[r"\b(?:major|severe|uncontrolled)\b.{0,20}\b(?:flood|flooding|leak|water)\b",r"\b(?:water|pipe)\b.{0,35}\b(?:gushing|pouring|everywhere|ankle[- ]deep|cannot stop|can't stop)\b",r"\b(?:burst|split)\s+(?:water\s+)?pipe\b"],
 "STRUCTURAL":[r"\b(?:ceiling|wall|roof|floor|building)\b.{0,35}\b(?:collaps(?:e|ed|ing)|falling|fell|sagging|bowing|unstable)\b",r"\b(?:serious|large|widening|moving)\b.{0,20}\bcrack\b",r"\bstructural\b.{0,25}\b(?:danger|unsafe|failure|collapse)\b"],
 "ENTRAPMENT":[r"\b(?:child|baby|person|someone|resident|tenant|I|we)\b.{0,35}\b(?:trapped|locked (?:in|inside)|cannot get out|can't get out)\b",r"\b(?:trapped|locked (?:in|inside))\b.{0,35}\b(?:child|baby|person|someone|resident|tenant)\b"],
}
WATER_ELECTRIC=(re.compile(r"\b(?:water|leak(?:ing)?|flood(?:ing)?)\b",re.I),re.compile(r"\b(?:electric(?:ity|al|s)?|socket|wire|cable|fuse box|consumer unit|light fitting|appliance)\b",re.I))
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
 "General maintenance":["repair","broken","damage"],
}

def safety_flags(text):
    t=text.lower() if isinstance(text,str) else ""
    descriptions={code:description for code,_terms,description in RED_RULES}
    codes={code for code,terms,_description in RED_RULES if any(term in t for term in terms)}
    for code,patterns in RED_PATTERNS.items():
        if any(re.search(pattern,t,re.I) for pattern in patterns):
            codes.add(code)
    if WATER_ELECTRIC[0].search(t) and WATER_ELECTRIC[1].search(t):
        codes.add("ELECTRICAL")
    return [{"code":code,"level":"RED","description":descriptions[code]} for code in descriptions if code in codes]

def human_escalation_flags(text):
    t=text.lower() if isinstance(text,str) else ""
    return [{"code":c,"level":level,"description":d} for c,terms,level,d in HUMAN_ESCALATION_RULES if any(x in t for x in terms)]

def classify(text):
    t=text.lower() if isinstance(text,str) else ""
    flags=safety_flags(text)
    human_flags=human_escalation_flags(text)
    scores={c:sum(1 for kw in kws if kw in t) for c,kws in CATEGORIES.items()}
    category=max(scores,key=scores.get) if scores and max(scores.values())>0 else "Unknown"
    return {
        "safety_flags":flags,
        "human_escalation_flags":human_flags,
        "human_review_required":bool(flags or human_flags or category=="Unknown"),
    }

FALSE_FINANCIAL_CONFIRMATION=re.compile(
    r"\b(?:payment|refund|compensation|fee|fees|credit|client money)\b.{0,45}\b(?:paid|processed|issued|approved|waived|credited|arranged|completed)\b|"
    r"\b(?:paid|processed|issued|approved|waived|credited|arranged|completed)\b.{0,45}\b(?:payment|refund|compensation|fee|fees|credit|client money)\b",re.I)
PARTY=(r"contractor|engineer|plumber|electrician|operative|emergency services|fire brigade|fire service|police|ambulance|999|human operator|human|operator|manager|landlord|council|agent|property manager|maintenance team|housing officer")
SUCCESS_VERB=(r"contacted|called|notified|alerted|informed|dispatched|sent|booked|assigned|arranged|organised|scheduled|engaged|instructed|mobilised")
ACTIVE_ACTION_CLAIM=re.compile(rf"\b(?:i|we|i've|we've|the system|our team)\s+(?:have\s+|has\s+|already\s+)?(?P<verb>{SUCCESS_VERB})\s+(?:for\s+)?(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\b",re.I)
PASSIVE_ACTION_CLAIM=re.compile(rf"\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\s+(?:has|have|was|were|is|are)\s+(?:already\s+)?(?:been\s+)?(?P<verb>{SUCCESS_VERB})\b",re.I)
CHAINED_ACTION_CLAIM=re.compile(rf"\b(?:and|then)\s+(?:have\s+|already\s+)?(?P<verb>{SUCCESS_VERB})\s+(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\b",re.I)
APPOINTMENT_CLAIM=re.compile(r"\b(?:the|your|an?)\s+(?:appointment|visit|slot)\s+(?:has|have|was|is)\s+(?:already\s+)?(?:been\s+)?(?:booked|confirmed|arranged)\b",re.I)
ON_THE_WAY_CLAIM=re.compile(rf"\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\s+(?:is|are)\s+(?:already\s+)?on\s+(?:the|their)\s+way\b",re.I)
COMING_CLAIM=re.compile(rf"\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\s+(?:is|are|will be|'s)\s+(?:already\s+)?(?:coming|attending|en route|on\s+(?:the|their)\s+way)\b",re.I)
REFERRAL_CLAIM=re.compile(rf"\b(?:i|we|i've|we've)\s+(?:have\s+|already\s+)?(?:passed|reported|referred|escalated)\s+(?:this|it|the\s+(?:issue|case|repair))\s+to\s+(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\b",re.I)
PARTY_AWARE_CLAIM=re.compile(rf"\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\s+(?:knows|know)\s+(?:already\s+)?about\s+(?:this|it|the\s+(?:issue|case|repair))\b|\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<informed_party>{PARTY})\s+(?:has|have)\s+(?:already\s+)?been\s+(?:told|informed|notified|alerted)\b",re.I)
NON_CONFIRMING_CONTEXT=re.compile(r"\b(?:cannot|can't|unable to|not able to|do not|don't|could not|couldn't)\s+(?:confirm|verify|say|contact|dispatch|book|notify|transfer|complete)\b|\b(?:no confirmation|no evidence|not yet|unconfirmed|unknown whether|still pending|awaiting confirmation|requested but|attempted but|tried to)\b",re.I)
TRANSFER_CLAIM=re.compile(r"\b(?:i|we|i've|we've|the system|our team)\s+(?:have\s+|has\s+|already\s+)?(?:transferred|connected|put)\s+you\s+(?:through|to)\b|\byou(?:'re| are)\s+(?:now\s+)?(?:connected|through)\s+to\b",re.I)
COMPLETION_CLAIM=re.compile(r"\b(?:the|your)\s+(?:repair|job|work|issue|case)\s+(?:has|have|was|is)\s+(?:already\s+)?(?:been\s+)?(?:completed|finished|fixed|resolved|closed)\b|\b(?:i|we|i've|we've)\s+(?:have\s+|already\s+)?(?:completed|finished|fixed|resolved|closed)\s+(?:the|your)\s+(?:repair|job|work|issue|case)\b",re.I)
CANCELLATION_CLAIM=re.compile(r"\b(?:the|your)\s+(?:appointment|booking|visit|slot)\s+(?:has|have|was|is)\s+(?:already\s+)?(?:been\s+)?cancelled\b|\b(?:i|we|i've|we've)\s+(?:have\s+|already\s+)?cancelled\s+(?:the|your)\s+(?:appointment|booking|visit|slot)\b",re.I)

def _action_for_claim(party,verb):
    party=party.lower(); verb=verb.lower()
    if party in {"emergency services","fire brigade","fire service","police","ambulance","999"}:
        return "emergency_services_dispatched" if verb in {"dispatched","sent","assigned","mobilised"} else "emergency_services_contacted"
    if party in {"human operator","human","operator","manager"}: return "human_operator_contacted"
    if party in {"contractor","engineer","plumber","electrician","operative"}:
        if verb=="booked": return "appointment_booked"
        if verb in {"dispatched","sent","assigned","arranged","organised","scheduled","engaged","instructed","mobilised"}: return "contractor_dispatched"
        return "contractor_contacted"
    return "other_party_notified"

def _sentence_for_match(text,start,end):
    left=max(text.rfind(".",0,start),text.rfind("!",0,start),text.rfind("?",0,start))+1
    ends=[p for mark in ".!?" if (p:=text.find(mark,end))>=0]
    right=min(ends)+1 if ends else len(text)
    return text[left:right].strip()

def _nonaffirmative(text,start,end):
    sentence=_sentence_for_match(text,start,end)
    return sentence.endswith("?") or bool(NON_CONFIRMING_CONTEXT.search(sentence))

def detect_action_claims(text):
    text=text or ""; claims=set()
    for pattern in (ACTIVE_ACTION_CLAIM,PASSIVE_ACTION_CLAIM,CHAINED_ACTION_CLAIM):
        for match in pattern.finditer(text):
            if _nonaffirmative(text,match.start(),match.end()): continue
            verb=match.groupdict().get("verb") or "contacted"
            claims.add(_action_for_claim(match.group("party"),verb))
    for pattern,verb in ((ON_THE_WAY_CLAIM,"dispatched"),(COMING_CLAIM,"dispatched"),(REFERRAL_CLAIM,"notified"),(PARTY_AWARE_CLAIM,"notified")):
        for match in pattern.finditer(text):
            if not _nonaffirmative(text,match.start(),match.end()):
                party=match.groupdict().get("party") or match.groupdict().get("informed_party")
                claims.add(_action_for_claim(party,verb))
    for match in APPOINTMENT_CLAIM.finditer(text):
        if not _nonaffirmative(text,match.start(),match.end()): claims.add("appointment_booked")
    for pattern,action in ((TRANSFER_CLAIM,"human_transfer_connected"),(COMPLETION_CLAIM,"repair_completed"),(CANCELLATION_CLAIM,"appointment_cancelled")):
        for match in pattern.finditer(text):
            if not _nonaffirmative(text,match.start(),match.end()): claims.add(action)
    return claims
