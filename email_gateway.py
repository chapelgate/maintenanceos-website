import os,imaplib,smtplib,email,uuid,json,urllib.request,urllib.error
from email.message import EmailMessage
from email.header import decode_header
from dotenv import load_dotenv
load_dotenv()

def live_email_enabled():
    email_mode = os.getenv("EMAIL_MODE", "mock")
    enable_live = os.getenv("ENABLE_LIVE_EMAIL", "false")
    if any(map(_has_control_chars, (email_mode, enable_live))):
        return False
    return (
        email_mode == "imap_smtp"
        and enable_live.strip().lower() == "true"
    )

def _truthy(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}

def smtp_configured():
    host = os.getenv("SMTP_HOST")
    user = os.getenv("SMTP_USERNAME")
    pw = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM") or user
    if any(map(_has_control_chars, (host, user, pw, sender))):
        return False
    return bool(host and user and pw and sender)

def _has_control_chars(value: str) -> bool:
    return any(ord(ch) < 32 for ch in value)


def _sender_address() -> str:
    user = os.getenv("SMTP_USERNAME", "").strip()
    if _has_control_chars(user):
        return ""
    sender = (os.getenv("SMTP_FROM") or user).strip()
    if _has_control_chars(sender):
        return ""
    return sender

def _resend_api_key():
    explicit = (os.getenv("RESEND_API_KEY") or "").strip()
    if _has_control_chars(explicit):
        return ""
    if explicit:
        return explicit
    user = os.getenv("SMTP_USERNAME", "").strip()
    pw = os.getenv("SMTP_PASSWORD", "").strip()
    if _has_control_chars(user) or _has_control_chars(pw):
        return ""
    if user.casefold() == "resend" or pw.startswith("re_"):
        return pw
    return ""

def pilot_resend_ready() -> bool:
    """Armed Chapelgate pilot may send via existing Resend HTTPS without ENABLE_LIVE_EMAIL.

    Prevents completed pilot calls from disappearing when the live-email flag was
    left false after credential/provider setup. Never logs secrets.
    """
    if not _truthy("PILOT_MODE_ARMED"):
        return False
    return bool(_resend_api_key() and _sender_address())

def email_gate_status() -> dict:
    """Boolean-only email gate diagnostics for /health (no secrets)."""
    return {
        "live_email_flag": live_email_enabled(),
        "pilot_resend_ready": pilot_resend_ready(),
        "resend_key_present": bool(_resend_api_key()),
        "sender_configured": bool(_sender_address()),
        "recipient_configured": bool(
            (os.getenv("INTERNAL_NOTIFICATION_EMAIL") or os.getenv("CHAPELGATE_NOTIFICATION_EMAIL") or "").strip()
        ),
    }

def decode_header_value(v):
    if not v:return ""
    out=""
    for data,enc in decode_header(v):
        if isinstance(data,bytes):out+=data.decode(enc or "utf-8",errors="replace")
        else:out+=data
    return out

def fetch_unseen():
    if not live_email_enabled():return []
    host=os.getenv("IMAP_HOST");user=os.getenv("IMAP_USERNAME");pw=os.getenv("IMAP_PASSWORD")
    if not all([host,user,pw]):return []
    port=int(os.getenv("IMAP_PORT","993"))
    im=imaplib.IMAP4_SSL(host,port);im.login(user,pw);im.select(os.getenv("IMAP_FOLDER","INBOX"))
    _,data=im.search(None,"UNSEEN")
    rows=[]
    for num in data[0].split():
        _,raw=im.fetch(num,"(RFC822)")
        msg=email.message_from_bytes(raw[0][1])
        body=""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type()=="text/plain" and "attachment" not in str(part.get("Content-Disposition","")):
                    body=(part.get_payload(decode=True) or b"").decode(part.get_content_charset() or "utf-8",errors="replace")
                    break
        else:
            body=(msg.get_payload(decode=True) or b"").decode(msg.get_content_charset() or "utf-8",errors="replace")
        rows.append({
          "message_id":msg.get("Message-ID") or f"<generated-{uuid.uuid4()}@maintenanceos>",
          "in_reply_to":msg.get("In-Reply-To",""),
          "references":msg.get("References",""),
          "sender":email.utils.parseaddr(msg.get("From",""))[1],
          "recipient":email.utils.parseaddr(msg.get("To",""))[1],
          "subject":decode_header_value(msg.get("Subject","")),
          "body":body
        })
    im.close();im.logout()
    return rows

def _send_resend_http(
    to,
    subject,
    body,
    sender,
    api_key,
    *,
    html_body=None,
    idempotency_key=None,
):
    payload_data={"from":sender,"to":[to],"subject":subject,"text":body}
    if html_body:
        payload_data["html"]=html_body
    headers={
        "Authorization":f"Bearer {api_key}",
        "Content-Type":"application/json",
        "User-Agent":"MaintenanceOS/1.0",
    }
    if idempotency_key:
        key=str(idempotency_key).strip()
        if not 1 <= len(key) <= 256:
            raise ValueError("invalid_resend_idempotency_key")
        headers["Idempotency-Key"]=key
    payload=json.dumps(payload_data).encode("utf-8")
    req=urllib.request.Request(
        os.getenv("RESEND_API_URL","https://api.resend.com/emails"),
        data=payload,
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req,timeout=10) as response:
            data=json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        # Do not include response body: provider errors can echo addresses/secrets.
        raise RuntimeError(f"resend_http_{exc.code}") from None
    return {"mock":False,"message_id":str(data.get("id") or f"<resend-{uuid.uuid4()}@api>"),"provider":"resend_https"}

def send_email(
    to,
    subject,
    body,
    *,
    html_body=None,
    idempotency_key=None,
    allow_smtp_fallback=False,
):
    """Send live mail without making SMTP a voice-call critical path.

    Prefer Resend HTTPS whenever an existing Resend credential is available.
    When the Chapelgate pilot is armed, Resend HTTPS is allowed even if
    ENABLE_LIVE_EMAIL was left false — completed calls must not vanish.
    Voice/completion dispatch keeps allow_smtp_fallback=False so a 30s SMTP
    timeout cannot stall the call lifecycle.
    """
    sender=_sender_address()
    resend_key=_resend_api_key()
    # Pilot fail-safe path: Resend HTTPS first, independent of EMAIL_MODE mock default.
    if pilot_resend_ready() and resend_key and sender:
        return _send_resend_http(
            to,
            subject,
            body,
            sender,
            resend_key,
            html_body=html_body,
            idempotency_key=idempotency_key,
        )
    if os.getenv("EMAIL_MODE","mock")!="imap_smtp":
        return {"mock":True,"message_id":f"<mock-{uuid.uuid4()}@maintenanceos>"}
    if not live_email_enabled():
        raise RuntimeError("Live email is disabled")
    user=os.getenv("SMTP_USERNAME","").strip()
    if resend_key and sender:
        return _send_resend_http(
            to,
            subject,
            body,
            sender,
            resend_key,
            html_body=html_body,
            idempotency_key=idempotency_key,
        )
    if not allow_smtp_fallback:
        raise RuntimeError("resend_https_required")
    if not smtp_configured():
        raise RuntimeError("Email sender configuration incomplete")
    host=os.getenv("SMTP_HOST","").strip()
    pw=os.getenv("SMTP_PASSWORD","").strip()
    port=int(os.getenv("SMTP_PORT","587"))
    use_tls=os.getenv("SMTP_USE_TLS","true").lower()=="true"
    use_ssl=os.getenv("SMTP_USE_SSL","false").lower()=="true"
    msg=EmailMessage();msg["From"]=sender;msg["To"]=to;msg["Subject"]=subject
    mid=f"<maintenanceos-{uuid.uuid4()}@local>";msg["Message-ID"]=mid;msg.set_content(body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")
    if use_ssl:
        with smtplib.SMTP_SSL(host,port,timeout=10) as s:
            s.login(user,pw);s.send_message(msg)
    else:
        with smtplib.SMTP(host,port,timeout=10) as s:
            if use_tls:s.starttls()
            s.login(user,pw);s.send_message(msg)
    return {"mock":False,"message_id":mid,"provider":"smtp"}
