import os,hmac,hashlib,base64,secrets,time
from dotenv import load_dotenv
load_dotenv()

INSECURE_APP_SECRETS={"","change-me","CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"}

def app_secret_ready()->bool:
    secret=os.getenv('APP_SECRET','')
    return len(secret)>=32 and secret not in INSECURE_APP_SECRETS

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

SIGNED_LINK_KINDS=frozenset({"accept","decline","availability","complete","voice_stream"})

def sign_link(kind:str,work_order_id:int,subject_id:int,expires_at:int|None=None):
    if kind not in SIGNED_LINK_KINDS:
        raise ValueError("unsupported link kind")
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
