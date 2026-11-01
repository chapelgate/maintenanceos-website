from datetime import datetime
from clock import utcnow
TARGETS={"P1":60,"P2":240,"P3":1440,"P4":4320}
def age_minutes(created_at,now=None):
    now=now or utcnow()
    return max(0,(now-created_at).total_seconds()/60)
def sla_status(urgency,created_at,now=None):
    target=TARGETS.get(urgency,1440)
    age=age_minutes(created_at,now)
    ratio=age/target if target else 0
    if ratio>=1:return "BREACHED",round(age,1),target
    if ratio>=.75:return "AT_RISK",round(age,1),target
    return "OK",round(age,1),target


def known_urgency(urgency) -> bool:
    return urgency in TARGETS
