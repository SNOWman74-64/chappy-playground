"""Collect this additional experiment without changing the original metrics snapshot."""
import json, sys
from pathlib import Path
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parent
LOG=ROOT/'logs'
SESSIONS=Path('C:/Users/user/.codex/sessions')

def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig')) if path.exists() else None

def elapsed(start,end):
    return round((datetime.fromisoformat(end.replace('Z','+00:00'))-datetime.fromisoformat(start.replace('Z','+00:00'))).total_seconds(),3)

def events(path):
    if not path.exists():return []
    out=[]
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        try:out.append(json.loads(line))
        except json.JSONDecodeError:pass
    return out

result={'captured_utc':datetime.now(timezone.utc).isoformat(),'experiment':read(ROOT/'LUNA-EXPERIMENT.json'),'notes':[
    'Both additional variants use the same existing plan, photos and initial prompt except variant folder/name and reasoning effort.',
    'Initial duration includes model execution and its own static checks; parent browser QA, integration, waiting and publishing are separate.',
    'Token totals sum completed CLI turns across initial and separately recorded repair invocations. Cached input and reasoning output are subtotals.',
    'Requested priority does not establish actual served tier. Unreported tier is null.',
    'Original metrics.json is an immutable earlier snapshot and is not recomputed by this collector.',
    'Shared photos were available from dispatch here, unlike the original xhigh run. This is an individual experiment, not a controlled general model ranking.'
]}
for effort in ['medium','high','solo']:
    variant='school-luna-'+effort
    stages=[]
    for p in sorted(LOG.glob(variant+'*-process.json')):
        stem=p.name.removesuffix('-process.json')
        process=read(p)
        rows=events(LOG/(stem+'-events.jsonl'))
        usages=[r['usage'] for r in rows if r.get('type')=='turn.completed']
        ids=[r['thread_id'] for r in rows if r.get('type')=='thread.started']
        stages.append({'name':'initial' if stem==variant else stem.removeprefix(variant+'-'),'start_utc':process['start'],'end_utc':process['end'],'seconds':elapsed(process['start'],process['end']),'exit_code':process['exitCode'],'session_id':ids[0] if ids else process.get('sessionId'),'completed_turn_usage':usages})
    stages.sort(key=lambda s:s['start_utc'])
    initial=next((s for s in stages if s['name']=='initial'),None)
    rows=events(LOG/(variant+'-events.jsonl'))
    session_id=next((e['thread_id'] for e in rows if e.get('type')=='thread.started'),None)
    contexts=[];timeline=[]
    if session_id:
        for p in SESSIONS.glob('*/*/*/*'+session_id+'*.jsonl'):
            for e in events(p):
                v=e.get('payload',{})
                if e.get('type')=='turn_context':contexts.append({k:v.get(k) for k in ['model','effort','service_tier']})
                if e.get('type')=='event_msg' and v.get('type')=='token_count' and v.get('info'):
                    timeline.append({'timestamp':e['timestamp'],'total':v['info'].get('total_token_usage')})
    usages=[u for s in stages for u in s['completed_turn_usage']]
    total={k:sum(u.get(k,0) for u in usages) for k in set().union(*(u.keys() for u in usages))} if usages else None
    if total:total['total_tokens']=total.get('input_tokens',0)+total.get('output_tokens',0)
    observed=contexts[0] if contexts else {}
    result[effort]={'id':variant,'session_id':session_id,'requested_model':'gpt-5.6-luna','requested_effort':'xhigh' if effort=='solo' else effort,'requested_service_tier':'priority','observed_model':observed.get('model'),'observed_effort':observed.get('effort'),'actual_service_tier':observed.get('service_tier'),'initial_seconds':initial['seconds'] if initial else None,'initial_usage':initial['completed_turn_usage'][0] if initial and initial['completed_turn_usage'] else None,'execution_seconds':sum(s['seconds'] for s in stages) if stages else None,'stages':stages,'usage':total,'browser_qa':read(LOG/(variant+'-browser.json'))}
    (LOG/(variant+'-usage-timeline.json')).write_text(json.dumps({'contexts':contexts,'token_counts':timeline},ensure_ascii=False,indent=2),encoding='utf-8')
if all(result[e]['stages'] for e in ['medium','high']):
    starts=[result[e]['stages'][0]['start_utc'] for e in ['medium','high']]
    ends=[result[e]['stages'][0]['end_utc'] for e in ['medium','high']]
    result['initial_overlap_seconds']=max(0,elapsed(max(starts),min(ends)))
(ROOT/'luna-experiment-metrics.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({e:{k:result[e][k] for k in ['observed_model','observed_effort','initial_seconds','execution_seconds','usage']} for e in ['medium','high']},ensure_ascii=False,indent=2))
