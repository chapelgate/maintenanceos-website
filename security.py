import os,hmac,hashlib,base64,secrets,time
from dotenv import load_dotenv
load_dotenv()

INSECURE_APP_SECRETS={"","change-me","CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"}

def app_secret_ready()->bool:
    secret=os.getenv('APP_SECRET','')
    return len(secret)>=32 and secret not in INSECURE_APP_SECRETS

def configured_internal_api_token()->str|None:
    token=os.getenv("INTERNAL_API_TOKEN","").strip()
    if not token or len(token)<32:
        return None
    if token in INSECURE_APP_SECRETS:
        return None
    return token

def internal_api_token_ready()->bool:
    return configured_internal_api_token() is not None

def hash_password(password:str)->str:
    salt=secrets.token_bytes(16)
    iterations=260000
    dk=hashlib.pbkdf2_hmac('sha256',password.encode(),salt,iterations)
    return f'pbkdf2_sha256${iterations}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(dk).decode()}'

def verify_password(password:str,stored:str)->bool:
    try:
        scheme,iters,salt_b64,hash_b64=stored.split('$',3)
        if scheme!='pbkdf2_sha256':return False
        salt=base64.urlsafe_b64decode(salt_b64.encode())
        expected=base64.urlsafe_b64decode(hash_b64.encode())
        actual=hashlib.pbkdf2_hmac('sha256',password.encode(),salt,int(iters))
        return hmac.compare_digest(actual,expected)
    except Exception:
        return False

CONTRACTOR_LINK_TTL_DEFAULT = 86400
CONTRACTOR_LINK_TTL_MIN = 300
CONTRACTOR_LINK_TTL_MAX = 604800


def contractor_link_ttl_seconds() -> int:
    raw = os.getenv("CONTRACTOR_LINK_TTL_SECONDS", "")
    if not raw:
        return CONTRACTOR_LINK_TTL_DEFAULT
    try:
        ttl = int(raw)
    except ValueError:
        return CONTRACTOR_LINK_TTL_DEFAULT
    if ttl < CONTRACTOR_LINK_TTL_MIN or ttl > CONTRACTOR_LINK_TTL_MAX:
        return CONTRACTOR_LINK_TTL_DEFAULT
    return ttl


def contractor_link_expires_at(now=None) -> int:
    base = int(time.time() if now is None else now)
    return base + contractor_link_ttl_seconds()


def sign_link(kind:str,work_order_id:int,subject_id:int,expires_at:int|None=None):
    if not app_secret_ready():
        raise RuntimeError("APP_SECRET is not configured securely")
    if expires_at is None:
        expires_at=int(time.time())+int(os.getenv("CONTRACTOR_LINK_TTL_SECONDS","86400"))
    secret=os.getenv('APP_SECRET','').encode()
    msg=f'{kind}:{work_order_id}:{subject_id}:{expires_at}'.encode()
    signature=base64.urlsafe_b64encode(hmac.new(secret,msg,hashlib.sha256).digest()).decode().rstrip('=')
    return f"{expires_at}.{signature}"

def verify_link(kind,work_order_id,subject_id,token,now=None):
    try:
        expiry_text,signature=token.split(".",1)
        expires_at=int(expiry_text)
        if expires_at < int(time.time() if now is None else now):return False
        expected=sign_link(kind,work_order_id,subject_id,expires_at)
        return hmac.compare_digest(expected,token)
    except (RuntimeError,TypeError,ValueError,AttributeError):
        return False
