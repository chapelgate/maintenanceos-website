# Post-report action role (Andy voice 15 Nov 2026 22:07 GMT). No LLM. Called by check.py every 30 min.
# Reads status files / daily disk council reports and ACTS: flags slips, nudges stalled jobs, notes dr eggbot follow-through misses.
# Never deletes, never kills or restarts units, never touches production omniroute.
import os, json, time, datetime, glob, re, subprocess
C='/home/andy/chapelgate'; D=C+'/dell-services/call-accountability'
TSV=C+'/dell-services/overnight-keepalive/jobs.tsv'; FL=C+'/jobs-work-dell/readiness/FAILURE-LOG.md'
ROLE_START=datetime.datetime(2026,11,15,22,7).timestamp()
STATE=D+'/state'; os.makedirs(STATE,exist_ok=True)

# ---- tier classifier (mac-council-lane scope F, 24 Nov 13:15) ----
TIER_CONF=C+'/dell-services/model-pin/review-tiers.conf'
_tier_cache=None
def _load_tier_conf():
    global _tier_cache
    if _tier_cache is not None: return _tier_cache
    _tier_cache={}
    try:
        for line in open(TIER_CONF):
            line=line.strip()
            if not line or line.startswith('#'): continue
            if '=' in line:
                k,v=line.split('=',1)
                _tier_cache[k.strip()]=v.strip()
    except Exception:
        _tier_cache={'release_path_globs':'release/*,main/*,deploy/*,auth/*,security/*,migrations/*,gate-*,spend/*,authority/*,merge-power/*,legal/*,signing/*,*.sh','release_path_docs':'docs/*,config/*,tests/*','tier_s_max_lines':'200','tier_s_globs':'docs/**,config/**,tests/**,**/*.md,**/*.cfg,**/*.ini,**/*.json,**/*.toml,**/*.yaml,**/*.yml','tier_f_globs':'council-*,job-run-v6.sh,check.py,actions.py,STEER.md,BRIEF.md,review-tiers.conf,model-pin/**','tier_f_description':'structural-fast: small non-release structural fixes to the council system itself','tier_f_exclusions':'release/*,main/*,deploy/*,auth/*,security/*,migrations/*,gate-*,spend/*,authority/*,merge-power/*,legal/*,signing/*,*.sh','default_tier':'R'}
    return _tier_cache

def _matches_glob(path, globs):
    import fnmatch, os
    base=os.path.basename(path)
    for g in globs.split(','):
        g=g.strip()
        if g and (fnmatch.fnmatch(path,g) or fnmatch.fnmatch(base,g)): return True
    return False

def classify_tier(changed_files, author_model_family=None):
    """Return ('S'|'R'|'F', reason, line_count) for a PR diff."""
    conf=_load_tier_conf()
    # count lines
    total_lines=0
    for f in changed_files:
        try:
            with open(f,'r',errors='ignore') as fp: total_lines+=sum(1 for _ in fp)
        except: pass
    # authority/spend/merge-power exclusion: anything changing what councils may decide,
    # spend, legal/signing, merge powers or release gates -> always tier R
    authority_keywords = ('spend', 'budget', 'authority', 'merge-power', 'legal', 'signing', 'release gate', 'merge power')
    for f in changed_files:
        base=os.path.basename(f).lower()
        low=f.lower()
        if any(kw in base or kw in low for kw in authority_keywords):
            return 'R', f'authority/spend/merge-power: {f}', total_lines
    # check release path -> R (exclusion: authority/spend/merge power always R)
    for f in changed_files:
        if _matches_glob(f, conf.get('release_path_globs','')):
            return 'R', f'release-path: {f} matches {conf["release_path_globs"]}', total_lines
    # tier F structural-fast: council-system area under line cap -> F, unless excluded (authority/spend/merge power -> R)
    f_max=int(conf.get('tier_f_max_lines','50'))
    f_globs=conf.get('tier_f_globs','')
    f_excl=conf.get('tier_f_exclusions','')
    if total_lines <= f_max:
        for f in changed_files:
            if _matches_glob(f, f_globs):
                if f_excl and _matches_glob(f, f_excl):
                    return 'R', f'tier-f excluded (authority/spend/merge power): {f} matches {f_excl}', total_lines
                return 'F', f'tier-f structural-fast: {f} matches {f_globs} ({total_lines} lines <= {f_max})', total_lines
    # check tier S max lines + tier S globs
    if total_lines <= int(conf.get('tier_s_max_lines','200')):
        s_globs=conf.get('tier_s_globs','')
        for f in changed_files:
            if _matches_glob(f, s_globs):
                return 'S', f'tier-s: {f} matches {s_globs} ({total_lines} lines)', total_lines
    return conf.get('default_tier','R'), 'default or no tier-s match', total_lines
def once(key, hours=24):
    p=os.path.join(STATE,re.sub(r'[^A-Za-z0-9_.-]','_',key))
    if os.path.exists(p) and time.time()-os.path.getmtime(p)<hours*3600: return False
    open(p,'w').write(str(time.time())); return True
def active(u):
    return subprocess.run(['systemctl','--user','is-active',u],capture_output=True,text=True).stdout.strip()
def run():
    now=time.time(); ts=datetime.datetime.now().strftime('%Y-%m-%d %H:%M GMT'); acts=[]; slips=[]
    # 1 landed reports: any MISSION_COMPLETE in jobs.tsv taskdirs -> check RESULT.md quality
    jobs=[]
    for l in open(TSV):
        p=l.rstrip('\n').split('\t')
        if len(p)>=3 and not l.startswith('#'): jobs.append((p[0],p[2]))
    for u,td in jobs:
        o=td+'/out'; mc=o+'/MISSION_COMPLETE'; sj=td+'/status.json'
        if os.path.exists(mc):
            if os.path.getmtime(mc)<ROLE_START: continue
            r=o+'/RESULT.md'; ok=os.path.exists(r) and os.path.getsize(r)>=300 and re.search(r'\bGO\b',open(r,errors='ignore').read())
            if not ok and once('shallow-'+u,72):
                slips.append(f'{u}: MISSION_COMPLETE but RESULT.md missing/short/no council GO (shallow completion)')
            continue
        if os.path.exists(C+'/dell-services/overnight-keepalive/state/'+u+'.councilstop'): continue
        if os.path.exists(sj):
            age=now-os.path.getmtime(sj)
            if active(u+'.service')=='active' and age>90*60 and once('nudge-'+u,6):
                with open(td+'/STEER.md','a') as f:
                    f.write(f'\n# NUDGE {ts} (accountability checker)\nNo status update for {int(age/60)} min. Stop whatever is looping, write progress to out/, and move to the next unfinished requirement in BRIEF.md now.\n')
                acts.append(f'nudged stalled {u} (no update {int(age/60)}m, STEER.md appended)')
    # 2 daily disk council report
    day=datetime.date.today().strftime('%Y%m%d'); rep=C+f'/dell-services/disk-council-daily/reports/{day}-VERDICTS.md'
    hr=datetime.datetime.now().hour
    if os.path.exists(rep):
        t=open(rep,errors='ignore').read()
        n={v:len(re.findall(r'\|\s*'+v,t,re.I)) for v in ['KEEP','ARCHIVE','DELETE']}
        if once('disk-report-'+day,48):
            acts.append(f"daily disk council report landed {day}: keep {n['KEEP']}, archive {n['ARCHIVE']}, bin {n['DELETE']} (awaiting council sign-off before any action)")
    elif hr>=8 and day>='20261116' and once('disk-missing-'+day,24):
        slips.append(f'daily disk council report for {day} missing after 08:00 (disk-council-daily.service {active("disk-council-daily.service")})')
    if os.path.exists(C+'/dell-services/disk-guard/state/critical') and once('disk-critical',6):
        slips.append('disk-guard reports root >=95% (state/critical)')
    if active('disk-council-daily.timer')!='active' and once('disk-timer-off',24):
        slips.append('disk-council-daily.timer is not active')
    # 2b watchdog tamper check (Andy: dr eggbot may not stop or mute eggbot-watchdog)
    import hashlib
    wd=C+'/dell-services/eggbot-watchdog'; base=wd+'/state/baseline.sha256'
    h=hashlib.sha256(open(wd+'/watchdog.py','rb').read()).hexdigest() if os.path.exists(wd+'/watchdog.py') else 'MISSING'
    if not os.path.exists(base): open(base,'w').write(h)
    if (active('eggbot-watchdog.timer')!='active' or h!=open(base).read().strip()) and once('watchdog-tamper',2):
        slips.append('eggbot-watchdog stopped, missing or its script changed since baseline: possible tampering by dr eggbot')
    # 3 dr eggbot follow-through promises
    for l in open(D+'/promises.tsv'):
        if l.startswith('#') or not l.strip(): continue
        i,due,chk,what=l.rstrip('\n').split('\t')
        dt=datetime.datetime.strptime(due,'%Y-%m-%d %H:%M').timestamp()
        k,_,t=chk.partition(':')
        if k.startswith('parked'): continue
        met=bool(glob.glob(os.path.join(C,t))) if k in('file','glob') else False
        if not met and now>dt and once('promise-'+i,24):
            slips.append(f'dr eggbot did not follow through: {i} {what} (due {due})')
            with open(FL,'a') as f:
                f.write(f'\n- {ts} | dr eggbot (Welsh Build 2 bot) | promise {i}: {what} | not delivered by {due} | should have delivered or re-planned before the due time (auto-logged by call-accountability)\n')
    # persist rolling log for the briefing
    with open(D+'/actions.log','a') as f:
        for a in acts: f.write(f'{ts} ACT {a}\n')
        for s in slips: f.write(f'{ts} SLIP {s}\n')
    recent=[l.rstrip() for l in open(D+'/actions.log')][-8:] if os.path.exists(D+'/actions.log') else []
    return recent
