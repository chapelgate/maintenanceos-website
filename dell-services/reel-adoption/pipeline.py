#!/usr/bin/env python3
# reel adoption pipeline (eggbot 17 Nov 2026 17:00 GMT, Andy voice call f4819e2c). No LLM in this tick.
# Every ADOPT/TRIAL in REEL-DECISIONS.md -> owner, next action, deadline, completion check, status.
# Unmapped ones get an OpenCode implement unit (job-run-v6.sh via OmniRoute). Writes ADOPTION-TRACKER.md.
import re, os, json, time, subprocess, datetime as dt, glob
H='/home/andy/chapelgate'; RR=H+'/jobs-work-dell/readiness/reel-review'; HERE=H+'/dell-services/reel-adoption'
FT=H+'/factory-tasks'; J=H+'/dell-services/overnight-keepalive/jobs.tsv'; P=H+'/dell-services/call-accountability/promises.tsv'
IMPL=H+'/dell-services/reel-implement'; RUN=H+'/jobs-work-dell/tasks/dell-fix-failing-builds-20261111/job-run-v6.sh'
STATE=HERE+'/state.json'; MAXLAUNCH=int(os.environ.get('MAXLAUNCH','3'))
now=dt.datetime.now(); st={}
try:
    st=json.load(open(STATE)) if os.path.exists(STATE) and os.path.getsize(STATE)>0 else {}  # eggbot 18 Nov 23:55: empty/corrupt state (disk-full 13:00) crashed every tick
except Exception: os.replace(STATE, STATE+'.corrupt-'+now.strftime('%Y%m%d-%H%M')); st={}
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')[:48].strip('-')
def mt(p):
    # eggbot 17 Nov 20:45: shallow only (recursive glob into repo/ clones caused 4.2G OOM + hour-long ticks)
    c=[p+'/out',p+'/history.log',p+'/status.json',p+'/STEER.md']+glob.glob(p+'/out/*')
    try: return max(os.path.getmtime(f) for f in c if os.path.exists(f))
    except Exception: return None
def active(u): return subprocess.run(['systemctl','--user','is-active','-q',u]).returncode==0
# 1 verdicts
rows=[]
for l in open(RR+'/REEL-DECISIONS.md'):
    c=[x.strip() for x in l.split('|')]
    if len(c)<6 or not re.search(r'\b(ADOPT|TRIAL)\b',c[3]): continue
    code=re.sub(r'^(bulk:)?andy-(first-)?video-instagram-','',c[1])
    if not re.fullmatch(r'D[A-Za-z0-9_-]{10}',code): continue
    v='ADOPT' if 'ADOPT' in c[3] else 'TRIAL'
    rows.append(dict(date=c[0],code=code,src='bulk' if c[1].startswith('bulk:') else 'sent',topic=c[2],verdict=v,raw=c[3],area=c[4],fu=c[5]))
seen={}; 
for r in rows: seen.setdefault(r['code'],r)
items={}
for l in open(IMPL+'/items.tsv'):
    u,_,job=l.rstrip('\n').partition('\t'); m=re.search(r'\b(D[A-Za-z0-9_-]{9,11})\b',job)
    if m: items[m.group(1)]=(u,job.split('. ')[1] if '. ' in job else job)
impl=open(RR+'/IMPLEMENTATION-STATUS.md').read() if os.path.exists(RR+'/IMPLEMENTATION-STATUS.md') else ''
fus=open(RR+'/FOLLOW-UPS.md').read() if os.path.exists(RR+'/FOLLOW-UPS.md') else ''
jobs=open(J).read(); launched=0; out=[]
for code,r in seen.items():
    s=st.setdefault(code,{'first_seen':now.strftime('%Y-%m-%d %H:%M')})
    dup=re.search(r'duplicate of (D\w+)',r['topic']+' '+r['fu']+' '+r['raw'],re.I) or ('duplicate' in r['raw'].lower() and re.search(r'(D\w{10})',r['fu']))
    unmapped=r['area'].lower().startswith('none') or not r['area']
    if code in items: u,act=items[code]; td=f'{FT}/{u}-20261117'; dl='2026-11-18 20:00'
    elif s.get('unit'): u=s['unit']; td=s['td']; act=s['action']; dl=s['deadline']
    elif dup: u=None; td=None; act=f"covered by {dup.group(1)}"; dl='-'
    else:
        u=f"reel-{r['verdict'].lower()}-{slug(r['topic'])}"; td=f'{FT}/{u}-{now:%Y%m%d}'
        act=('Implement' if r['verdict']=='ADOPT' else 'Run a sandboxed trial of')+f" reel {code} ({r['topic']}) for {r['area']}"
        dl=(now+dt.timedelta(hours=48)).strftime('%Y-%m-%d %H:%M')
        if launched<MAXLAUNCH and u not in jobs:
            os.makedirs(td+'/out',exist_ok=True); os.makedirs(td+'/repo',exist_ok=True)
            brief=open(IMPL+'/HEADER.md').read()+f"\nreel {code} {r['verdict']} (council {r['date']}): {r['topic']}. Area: {r['area']}. Council follow-up: {r['fu']}. Read its row in {RR}/REEL-DECISIONS.md, its review (/mnt/d/reel-bulk/reviews or video-outbox REVIEW.md) and FOLLOW-UPS.md. {act}: smallest real change, own repos only, PRs through merge council until merged; trials report-only in a sandbox with a written ADOPT/WATCH/DROP result. Append progress lines to {RR}/IMPLEMENTATION-STATUS.md and write out/RESULT.md when done. Spend/legal/signing/deletes go to readiness/PARKED.md with a free route-around.\n"
            open(td+'/BRIEF.md','w').write(brief); open(td+'/STEER.md','a').close()
            stamp=now.strftime('%Y%m%d-%H%M')
            for f in (J,P): subprocess.run(['cp',f,f'{f}.bak-eggbot-{stamp}'])
            open(J,'a').write(f'{u}\tv6\t{td}\t120\t-\n'); jobs+=u
            subprocess.run(['bash','-c','source ~/.bashrc 2>/dev/null; . ~/.config/chapelgate-watchman.env 2>/dev/null; set +a 2>/dev/null; /home/andy/chapelgate/dell-services/call-accountability/add-promise.sh {} \"{}\" \"{}\"'.format(dl, 'file:'+td[len(H)+1:]+'/out/RESULT.md', u)])
            env=dict(os.environ); env.update(OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER='true')
            subprocess.run(['bash','-c',f'set -a; . ~/.config/chapelgate-watchman.env; set +a; systemd-run --user --unit={u} --working-directory={H} --setenv=OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER=true --setenv=OMNIROUTE_API_KEY="$OMNIROUTE_API_KEY" /usr/bin/bash {RUN} {td} 120 >/dev/null 2>&1'])
            s.update(unit=u,td=td,action=act,deadline=dl,launched=now.strftime('%Y-%m-%d %H:%M')); launched+=1
        elif u not in jobs: u=None; td=None; act='queued: launches next tick'
        else: s.update(unit=u,td=td,action=act,deadline=dl)
    # status + completion check
    done_impl=re.search(rf'{code}[^\n]*\|\s*DONE',impl)
    sec=bool(re.search(r'secur|oauth|password|tenant|idor|insurer|release gate|vulnerab|pentest|xss|csrf|cve|gdpr',(r['topic']+' '+r['area']+' '+r['fu']).lower()))
    has_mission_complete = td and os.path.exists(td+'/out/MISSION_COMPLETE')
    has_result = td and os.path.exists(td+'/out/RESULT.md')
    res = has_result or (not sec and has_mission_complete)
    last=mt(td) if td and os.path.isdir(td) else None
    lastimpl=[l for l in impl.splitlines() if code in l]
    passed = res or done_impl or has_mission_complete
    if res or (done_impl and not (u and active(u))): status='shipped'
    elif (u and active(u)) or lastimpl or (last and now.timestamp()-last<6*3600): status='in progress'
    else: status='not started' if not dup else 'covered'
    upd=dt.datetime.fromtimestamp(last).strftime('%d %b %H:%M') if last else (lastimpl[-1][:17] if lastimpl else '-')
    stalled = status not in('shipped','covered') and not passed and dl!='-' and now>dt.datetime.strptime(dl,'%Y-%m-%d %H:%M') and (not last or now.timestamp()-last>6*3600)
    if status=='shipped' and not s.get('reported'):
        open(RR+'/IMPLEMENTATION-STATUS.md','a').write(f"{now:%Y-%m-%d %H:%M} GMT | adoption-pipeline | reel {code} | COMPLETE-CHECK PASSED | {u or '-'} | {td+'/out/RESULT.md' if res else 'IMPLEMENTATION-STATUS DONE line'}\n")
        open(H+'/dell-watch/ALERTS.md','a').write(f"- {now:%Y-%m-%d %H:%M} GMT reel adoption: {r['verdict']} {code} ({r['topic']}) shipped, check passed.\n"); s['reported']=now.strftime('%Y-%m-%d %H:%M')
    if stalled and s.get('stall_alert','')[:10]!=now.strftime('%Y-%m-%d'):
        open(H+'/dell-watch/ALERTS.md','a').write(f"- {now:%Y-%m-%d %H:%M} GMT reel adoption STALLED: {code} ({r['topic']}) past {dl}, no update since {upd}, unit {u}.\n"); s['stall_alert']=now.strftime('%Y-%m-%d %H:%M')
    where=[]; 
    if code in fus: where.append('FOLLOW-UPS.md')
    if lastimpl: where.append('IMPLEMENTATION-STATUS.md')
    if td: where.append(td.replace(H+'/','')+'/out/')
    out.append(dict(r,unit=u or '-',act=act,dl=dl,status=status,upd=upd,stalled=stalled,unmapped=unmapped,where=', '.join(where) or '-',check=(f"{td.replace(H+'/','')}/out/RESULT.md exists or DONE line" if td else ('covered by original' if dup else 'unit out/RESULT.md once launched'))))
json.dump(st,open(STATE+'.tmp','w'),indent=1); os.replace(STATE+'.tmp',STATE)  # atomic
# parked lane
parked=[]; cur=None
for l in open(H+'/jobs-work-dell/readiness/PARKED.md'):
    if l.startswith('## '): cur=[l[3:].strip(),''] ; parked.append(cur)
    elif cur and not cur[1] and not l.lstrip().startswith('|') and re.search(r'route|around|free|instead|workaround',l,re.I): cur[1]=l.strip('-* \n')[:220]
md=[f"# Reel adoption tracker + pipeline\n\nAuto-generated every 15 min by dell-services/reel-adoption/pipeline.py (reel-adoption.timer), last run {now:%d %b %Y %H:%M} GMT. Every ADOPT or TRIAL in REEL-DECISIONS.md lands here automatically. Unmapped ones get an OpenCode implement unit on the Dell (up to {MAXLAUNCH} per tick) with a 48h deadline. Completion check: out/RESULT.md in the taskdir, or a DONE line in IMPLEMENTATION-STATUS.md; on pass it logs COMPLETE-CHECK PASSED and a line in dell-watch/ALERTS.md. Do not edit by hand.\n",
 f"**{len(out)} items**: {sum(o['verdict']=='ADOPT' for o in out)} adopt, {sum(o['verdict']=='TRIAL' for o in out)} trial | shipped {sum(o['status']=='shipped' for o in out)}, in progress {sum(o['status']=='in progress' for o in out)}, not started {sum(o['status']=='not started' for o in out)}, stalled {sum(o['stalled'] for o in out)}, unmapped {sum(o['unmapped'] for o in out)}\n",
 "## Stalled (past deadline, no progress for 6h+)\n"]
st_=[o for o in out if o['stalled']]
md+= [f"- {o['code']} {o['topic']}: due {o['dl']}, last update {o['upd']}, unit {o['unit']}" for o in st_] or ['- none']
md+=["\n## Tracker\n","| reel | topic | verdict | date | source | owning product / area | owning build | next action | deadline | status | last update | completion check | write-up |","|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
for o in sorted(out,key=lambda o:(o['status']=='shipped',o['verdict'],o['code'])):
    area=('UNMAPPED, ' if o['unmapped'] else '')+o['area']
    md.append('| '+' | '.join(x.replace('|','/') for x in [o['code'],o['topic'],o['verdict']+(' (stalled)' if o['stalled'] else ''),o['date'],o['src'],area,o['unit'],o['act'][:140],o['dl'],o['status'],o['upd'],o['check'],o['where']])+' |')
md+=["\n## Parked lane (readiness/PARKED.md, visible, not blocking)\n","| parked item | free route-around noted |","|---|---|"]
md+=[f"| {p[0].replace('|','/')} | {p[1].replace('|','/') or 'none written'} |" for p in parked]
tmp=RR+'/ADOPTION-TRACKER.md.tmp'; open(tmp,'w').write('\n'.join(md)+'\n'); os.replace(tmp,RR+'/ADOPTION-TRACKER.md')
print(f"{now:%H:%M} items={len(out)} launched={launched}")
