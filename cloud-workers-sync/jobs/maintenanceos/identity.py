def normalise_phone(value:str)->str:
    s="".join(ch for ch in (value or "") if ch.isdigit() or ch=="+")
    if s.startswith("0044"): s="+44"+s[4:]
    if s.startswith("07"): s="+44"+s[1:]
    return s

def normalise_postcode(value:str)->str:
    return "".join((value or "").upper().split())

def postcode_matches(expected:str,supplied:str)->bool:
    a=normalise_postcode(expected);b=normalise_postcode(supplied)
    return bool(a and b and a==b)
