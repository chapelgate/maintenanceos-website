import os,imaplib,smtplib,email,uuid,json,urllib.request
from email.message import EmailMessage
from email.header import decode_header
from dotenv import load_dotenv
load_dotenv()

def live_email_enabled():
    return (
        os.getenv("EMAIL_MODE", "mock") == "imap_smtp"
        and os.getenv("ENABLE_LIVE_EMAIL", "false").lower() == "true"
    )

def smtp_configured():
    host=os.getenv("SMTP_HOST");user=os.getenv("SMTP_USERNAME");pw=os.getenv("SMTP_PASSWORD")
    sender=os.getenv("SMTP_FROM") or user
    return bool(host and user and pw and sender)

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

def _send_resend_http(to, subject, body, sender, api_key):
    payload=json.dumps({"from":sender,"to":[to],"subject":subject,"text":body}).encode("utf-8")
    req=urllib.request.Request(
        os.getenv("RESEND_API_URL","https://api.resend.com/emails"),
        data=payload,
        headers={"Authorization":f"Bearer {api_key}","Content-Type":"application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req,timeout=10) as response:
        data=json.loads(response.read().decode("utf-8"))
    return {"mock":False,"message_id":str(data.get("id") or f"<resend-{uuid.uuid4()}@api>")}

def send_email(to,subject,body):
    """Send live mail without ever making SMTP a voice-call critical path.

    Resend SMTP credentials are also valid API credentials, so Resend-hosted
    configurations prefer HTTPS and fall back to SMTP only if the API fails.
    """
    if os.getenv("EMAIL_MODE","mock")!="imap_smtp":
        return {"mock":True,"message_id":f"<mock-{uuid.uuid4()}@maintenanceos>"}
    if not live_email_enabled():
        raise RuntimeError("Live email is disabled")
    if not smtp_configured():
        raise RuntimeError("SMTP configuration incomplete")
    host=os.getenv("SMTP_HOST");user=os.getenv("SMTP_USERNAME");pw=os.getenv("SMTP_PASSWORD")
    sender=os.getenv("SMTP_FROM") or user
    if host and host.lower().endswith("resend.com"):
        try:
            return _send_resend_http(to,subject,body,sender,pw)
        except Exception:
            pass
    port=int(os.getenv("SMTP_PORT","587"))
    use_tls=os.getenv("SMTP_USE_TLS","true").lower()=="true"
    use_ssl=os.getenv("SMTP_USE_SSL","false").lower()=="true"
    msg=EmailMessage();msg["From"]=sender;msg["To"]=to;msg["Subject"]=subject
    mid=f"<maintenanceos-{uuid.uuid4()}@local>";msg["Message-ID"]=mid;msg.set_content(body)
    if use_ssl:
        with smtplib.SMTP_SSL(host,port,timeout=30) as s:
            s.login(user,pw);s.send_message(msg)
    else:
        with smtplib.SMTP(host,port,timeout=30) as s:
            if use_tls:s.starttls()
            s.login(user,pw);s.send_message(msg)
    return {"mock":False,"message_id":mid}
