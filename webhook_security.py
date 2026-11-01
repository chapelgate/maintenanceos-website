import hmac
import os
import re
from urllib.parse import urlsplit
from twilio.request_validator import RequestValidator


E164 = re.compile(r"^\+[1-9][0-9]{7,14}$")


def _has_control_chars(value: str) -> bool:
    return any(ord(ch) < 32 for ch in value)


def public_https_origin_ready() -> bool:
    value = os.getenv("PUBLIC_BASE_URL", "").strip()
    try:
        parsed = urlsplit(value)
    except ValueError:
        return False
    host = (parsed.hostname or "").casefold()
    return bool(
        parsed.scheme == "https"
        and host
        and host not in {"localhost", "127.0.0.1", "::1"}
        and "your-public-domain" not in host
        and not parsed.username
        and not parsed.password
        and not parsed.query
        and not parsed.fragment
        and parsed.path in {"", "/"}
    )


def dedicated_test_number_ready() -> bool:
    number = os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    transfer = os.getenv("TWILIO_HUMAN_TRANSFER_NUMBER", "").strip()
    return bool(
        os.getenv("TWILIO_TEST_NUMBER_CONFIRMED", "false").lower() == "true"
        and E164.fullmatch(number)
        and E164.fullmatch(transfer)
        and not hmac.compare_digest(number, transfer)
    )


def targets_dedicated_test_number(params: dict) -> bool:
    if not dedicated_test_number_ready():
        return False
    target = str(params.get("To") or params.get("Called") or "").removeprefix("whatsapp:")
    return bool(target) and hmac.compare_digest(target, os.getenv("TWILIO_PHONE_NUMBER", "").strip())


def public_provider_ingress_ready() -> bool:
    return bool(
        os.getenv("ENABLE_PUBLIC_PROVIDER_INGRESS", "false").lower() == "true"
        and os.getenv("VERIFY_TWILIO_SIGNATURES", "false").lower() == "true"
        and public_https_origin_ready()
        and dedicated_test_number_ready()
    )

def _public_http_candidate(url:str)->str:
    base=os.getenv("PUBLIC_BASE_URL","").strip().rstrip("/")
    if not base.startswith("https://"):
        return ""
    parsed=urlsplit(url)
    suffix=parsed.path or "/"
    if parsed.query:
        suffix+=f"?{parsed.query}"
    return base+suffix

def validate_twilio(url:str,params:dict,signature:str)->bool:
    if _has_control_chars(url) or _has_control_chars(signature or ""):
        return False
    if os.getenv("VERIFY_TWILIO_SIGNATURES","false").lower()!="true":
        return False
    token=os.getenv("TWILIO_AUTH_TOKEN","")
    if not token:return False
    validator=RequestValidator(token)
    candidates={url,_public_http_candidate(url)}
    return any(validator.validate(candidate,params,signature or "") for candidate in candidates if candidate)

def validate_twilio_websocket(url:str,signature:str)->bool:
    if _has_control_chars(url) or _has_control_chars(signature):
        return False
    if os.getenv("VERIFY_TWILIO_SIGNATURES","false").lower()!="true":
        return False
    token=os.getenv("TWILIO_AUTH_TOKEN","")
    if not token or not url or not signature:return False
    validator=RequestValidator(token)
    http_url="https://"+url[6:] if url.startswith("wss://") else url
    websocket_url="wss://"+url[8:] if url.startswith("https://") else url
    candidates={
        url,url.rstrip("/"),url.rstrip("/")+"/",
        http_url,http_url.rstrip("/"),http_url.rstrip("/")+"/",
        websocket_url,websocket_url.rstrip("/"),websocket_url.rstrip("/")+"/",
    }
    return any(validator.validate(candidate,{},signature) for candidate in candidates if candidate)
