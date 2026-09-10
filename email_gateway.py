import os,imaplib,smtplib,email,uuid
from email.message import EmailMessage
from email.header import decode_header
from dotenv import load_dotenv
load_dotenv()

def live_email_enabled():
    return (
        os.getenv("EMAIL_MODE", "mock") == "imap_smtp"
        and os.getenv("ENABLE_LIVE_EMAIL", "false").lower() == "true"
    )

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

def send_email(to,subject,body):
    if os.getenv("EMAIL_MODE","mock")!="imap_smtp":
        return {"mock":True,"message_id":f"<mock-{uuid.uuid4()}@maintenanceos>"}
    if not live_email_enabled():
        raise RuntimeError("Live email is disabled")
    host=os.getenv("SMTP_HOST");user=os.getenv("SMTP_USERNAME");pw=os.getenv("SMTP_PASSWORD")
    sender=os.getenv("SMTP_FROM") or user
    if not all([host,user,pw,sender]):raise RuntimeError("SMTP configuration incomplete")
    msg=EmailMessage();msg["From"]=sender;msg["To"]=to;msg["Subject"]=subject
    mid=f"<maintenanceos-{uuid.uuid4()}@local>";msg["Message-ID"]=mid;msg.set_content(body)
    with smtplib.SMTP(host,int(os.getenv("SMTP_PORT","587")),timeout=30) as s:
        if os.getenv("SMTP_USE_TLS","true").lower()=="true":s.starttls()
        s.login(user,pw);s.send_message(msg)
    return {"mock":False,"message_id":mid}
