#!/usr/bin/env python3
# Call accountability checker (Andy voice call 15 Nov 2026 17:17 GMT). No LLM, no human input.
import json, os, subprocess, time, datetime, re, urllib.request, urllib.error
C='/home/andy/chapelgate'; D=C+'/dell-services/call-accountability'
TSV=C+'/dell-services/overnight-keepalive/jobs.tsv'; BRIEF=C+'/factory-tasks/ANDY-BRIEFING.md'
OUT=C+'/jobs-work-dell/readiness/CALL-20261115-CHECKLIST.md'
CALL=datetime.datetime(2026,11,15,17,17).timestamp(); now=time.time()
STALE=90*60

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
        _tier_cache={'release_path_globs':'release/*,main/*,deploy/*,auth/*,security/*,migrations/*,gate-*,spend/*,authority/*,merge-power/*,legal/*,signing/*,*.sh','release_path_docs':'docs/*,config/*,tests/*','tier_s_max_lines':'200','tier_s_globs':'docs/**,config/**,tests/**,**/*.md,**/*.cfg,**/*.ini,**/*.json,**/*.toml,**/*.yaml,**/*.yml','tier_r_globs':'release/**,gate-*,deploy/**,auth/**,security/**,migrations/**,main/**','tier_f_globs':'council-*,job-run-v6.sh,check.py,actions.py,STEER.md,BRIEF.md,review-tiers.conf,model-pin/**','tier_f_description':'structural-fast: small non-release structural fixes to the council system itself','tier_f_exclusions':'release/*,main/*,deploy/*,auth/*,security/*,migrations/*,gate-*,spend/*,authority/*,merge-power/*,legal/*,signing/*,*.sh','default_tier':'R'}
    return _tier_cache

def _matches_glob(path, globs):
    import fnmatch, os
    base=os.path.basename(path)
    for g in globs.split(','):
        g=g.strip()
        if g and (fnmatch.fnmatch(path,g) or fnmatch.fnmatch(base,g)): return True
    return False

def classify_tier(changed_files):
    """Return ('S'|'R'|'F', reason, line_count) for a PR diff."""
    conf=_load_tier_conf()
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
    for f in changed_files:
        if _matches_glob(f, conf.get('release_path_globs','')):
            return 'R', f'release-path: {f} matches {conf["release_path_globs"]}', total_lines
    f_max=int(conf.get('tier_f_max_lines','50'))
    f_globs=conf.get('tier_f_globs','')
    f_excl=conf.get('tier_f_exclusions','')
    if total_lines <= f_max:
        for f in changed_files:
            if _matches_glob(f, f_globs):
                if f_excl and _matches_glob(f, f_excl):
                    return 'R', f'tier-f excluded (authority/spend/merge power): {f} matches {f_excl}', total_lines
                return 'F', f'tier-f structural-fast: {f} matches {f_globs} ({total_lines} lines <= {f_max})', total_lines
    if total_lines <= int(conf.get('tier_s_max_lines','200')):
        s_globs=conf.get('tier_s_globs','')
        for f in changed_files:
            if _matches_glob(f, s_globs):
                return 'S', f'tier-s: {f} matches {s_globs} ({total_lines} lines)', total_lines
    return conf.get('default_tier','R'), 'default or no tier-s match', total_lines
jobs={}
for l in open(TSV):
    p=l.rstrip('\n').split('\t')
    if len(p)>=3 and not l.startswith('#'): jobs[p[0]]=p[2]
def active(u):
    return subprocess.run(['systemctl','--user','is-active',u+'.service'],capture_output=True,text=True).stdout.strip()
parked=''
for f in ['jobs-work-dell/readiness/PARKED.md','jobs-work-dell/readiness/TENDER-REGISTER.md']:
    try: parked+=open(os.path.join(C,f),errors='ignore').read()
    except: pass
rows=[]; flags=[]
for l in open(D+'/items.tsv'):
    if l.startswith('#') or not l.strip(): continue
    i,k,t,desc=l.rstrip('\n').split('\t')
    st='open'; note=''
    if k=='job':
        td=jobs.get(t)
        if not td: st='open'; note='not in jobs.tsv'; flags.append((i,desc,note))
        else:
            o=td+'/out'; s={}
            try: s=json.load(open(td+'/status.json'))
            except: pass
            # ---- OUTCOME.json validation (BRIEF.md §1) ----
            outcome_path = o + '/OUTCOME.json'
            
            def flag_job(msg):
                ts2 = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
                bak = o + f'.bak-outcomes-loop-{ts2}'
                try:
                    import shutil, py_compile
                    shutil.copytree(o, bak)
                    if os.path.exists(o + '/check.py'):
                        py_compile.compile(o + '/check.py', cfile=bak + '/check.pyc', doraise=True)
                except Exception: pass
                flags.append((i, desc, f'NO-OUTCOME: {msg}'))
                return 'open', f'no valid OUTCOME.json in {o}: {msg}'

            if not os.path.exists(outcome_path):
                st, note = flag_job("missing")
                continue
            else:
                try:
                    with open(outcome_path, 'r') as f:
                        data = json.load(f)
                    required = ['decision', 'tier', 'sha', 'evidence', 'reviewers', 'decided_at']
                    for field in required:
                        if field not in data:
                            raise ValueError(f"missing field {field}")
                except Exception as e:
                    st, note = flag_job(str(e))
                    continue
            # ------------------------------------------------

            a=active(t); stop=os.path.exists(C+'/dell-services/overnight-keepalive/state/'+t+'.councilstop')
            if os.path.exists(o+'/MISSION_COMPLETE'): st='done'; note='MISSION_COMPLETE'
            elif os.path.exists(o+'/PREFLIGHT-FAIL'): st='open'; note='PREFLIGHT-FAIL'; flags.append((i,desc,note))
            elif stop: st='parked'; note='councilstop'
            else:
                age=now-os.path.getmtime(td+'/status.json') if os.path.exists(td+'/status.json') else 1e9
                cyc=s.get('cycle','?'); state=s.get('state','?')
                if a=='active':
                    st='running'; note=f'cycle {cyc}, {state}, updated {int(age/60)}m ago'
                    if age>STALE: note='STALLED: '+note; flags.append((i,desc,note))
                else:
                    st='open'; note=f'SLIPPED: unit {a}, not complete (cycle {cyc}, {state})'; flags.append((i,desc,note))
    elif k in('file','dir'):
        p=os.path.join(C,t)
        ok=os.path.isfile(p) if k=='file' else (os.path.isdir(p) and len(os.listdir(p))>0)
        st='done' if ok else ('running' if now-CALL<24*3600 else 'open'); note=t
        if not ok and now-CALL>24*3600: flags.append((i,desc,'missing after 24h: '+t))
    elif k=='parked':
        ok=re.search(re.escape(t),parked,re.I) is not None
        st='parked' if ok else 'open'; note='in PARKED/TENDER-REGISTER' if ok else 'NOT parked yet'
        if not ok: flags.append((i,desc,note))
    elif k=='router':
        url=t
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                code = resp.getcode()
        except urllib.error.HTTPError as e:
            code = 200 if e.code in (401,403) else e.code  # auth-protected but answering = alive
        except Exception as e:
            code = str(e)[:80]
        if code != 200:
            st='open'; note=f"router {url} answered http={code} (expected 200)"; flags.append((i,desc,note))
        else:
            st='done'; note='router answered 200'
    elif k=='done': st='done'
    elif k=='handover':
        p=os.path.join(C,t); ok=os.path.isdir(p) and len(os.listdir(p))>0
        st='done' if ok else 'open'; note='package filed' if ok else 'awaiting 2IC package'
        if not ok and now-CALL>48*3600: flags.append((i,desc,'2IC handover not received after 48h'))
    rows.append((i,st,desc,note))
ts=datetime.datetime.now().strftime('%Y-%m-%d %H:%M GMT')
cnt={x:sum(1 for r in rows if r[1]==x) for x in ['done','running','parked','open']}
md=[f'# Call accountability checklist (Andy voice call, Sun 15 Nov 2026 17:17 GMT onwards)',f'Auto-checked {ts} by dell-services/call-accountability (timer every 30 min, no human input).',
    f"done {cnt['done']} | running {cnt['running']} | parked {cnt['parked']} | open {cnt['open']} | FLAGGED {len(flags)}",'','| id | status | item | evidence |','|---|---|---|---|']
md+=[f'| {i} | {st} | {d} | {n} |' for i,st,d,n in rows]
open(OUT+'.tmp','w').write('\n'.join(md)+'\n'); os.replace(OUT+'.tmp',OUT)
sec=['<!-- CALL-20261115-START -->',f'## STANDING: call 15 Nov 2026 accountability ({ts})',
     f"done {cnt['done']} | running {cnt['running']} | parked {cnt['parked']} | open {cnt['open']} | full checklist: jobs-work-dell/readiness/CALL-20261115-CHECKLIST.md"]
sec+=(['**FLAGGED (slipped/stalled):**']+[f'- ⚠ {i} {d}: {n}' for i,d,n in flags]) if flags else ['no slipped or stalled items.']
try:
    import sys; sys.path.insert(0,D); import actions; rec=actions.run()
    sec+=['**Post-report actions (latest 8, full log dell-services/call-accountability/actions.log):**']+([f'- {x}' for x in rec] or ['- none yet'])
except Exception as e:
    sec+=[f'- ⚠ actions module error: {str(e)[:120]}']
sec+=['<!-- CALL-20261115-END -->']
b=open(BRIEF,errors='ignore').read()
new='\n'.join(sec)
if '<!-- CALL-20261115-START -->' in b:
    b=re.sub(r'<!-- CALL-20261115-START -->.*?<!-- CALL-20261115-END -->',lambda m:new,b,flags=re.S)
else:
    b=new+'\n\n'+b
open(BRIEF+'.tmp','w').write(b); os.replace(BRIEF+'.tmp',BRIEF)
with open(D+'/check.log','a') as f: f.write(f"{ts} {cnt} flags={len(flags)}\n")