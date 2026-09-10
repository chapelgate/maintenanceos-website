import os
from models import *
from security import hash_password
from dotenv import load_dotenv

load_dotenv()
admin_email=(os.getenv("BOOTSTRAP_ADMIN_EMAIL") or "").strip()
admin_password=os.getenv("BOOTSTRAP_ADMIN_PASSWORD") or ""
if not admin_email or not admin_password or admin_password == "ChangeMe123!" or len(admin_password) < 12:
    raise SystemExit("Refusing to seed: set a non-default BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD of at least 12 characters.")

init_db()
with SessionLocal() as s:
    if s.query(Client).count()==0:
        c=Client(name="Demo Property Management",quote_approval_limit=250,invoice_variance_percent=10);s.add(c);s.flush()
        s.add(User(client_id=c.id,email=admin_email,password_hash=hash_password(admin_password),role="admin"))
        p=Property(client_id=c.id,address="21 Smith Street, Wallasey",postcode="CH45 2AB",property_type="Terraced");s.add(p);s.flush()
        r=Resident(client_id=c.id,property_id=p.id,name="John Smith",phone="+447123456789",email="john@example.com");s.add(r)
        rows=[
          ("Wirral Plumbing","Plumber","CH44,CH45,CH46","plumber@example.com",75,55,4.8,.94,.90,35),
          ("Mersey Heating","Heating Engineer","CH41,CH42,CH43,CH44,CH45,CH46","heating@example.com",95,65,4.9,.96,.91,30),
          ("Peninsula Electrical","Electrician","CH44,CH45,CH46","electric@example.com",85,60,4.8,.92,.93,45),
          ("Wirral Locks","Locksmith","CH44,CH45,CH46","locks@example.com",80,55,4.9,.97,.95,25),
          ("General Property Response","Handyperson","CH41,CH42,CH43,CH44,CH45,CH46","general@example.com",60,45,4.5,.90,.87,60)
        ]
        for n,t,a,e,co,hr,ra,ac,ff,resp in rows:
            s.add(Contractor(client_id=c.id,name=n,trade=t,postcode_coverage=a,email=e,qualification_summary="DEMO ONLY",qualification_expiry="2027-06-30",insurance_expiry="2027-06-30",callout_rate=co,hourly_rate=hr,rating=ra,acceptance_rate=ac,first_time_fix_rate=ff,avg_response_minutes=resp))
        s.commit()
print("Demo data ready.")
