"""Read session counters without changing either experiment's original records."""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parent
LAB=ROOT.parent
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def seconds(a,b): return (datetime.fromisoformat(b.replace('Z','+00:00'))-datetime.fromisoformat(a.replace('Z','+00:00'))).total_seconds()
def session(sid):
    files=list((Path.home()/'.codex/sessions').glob('*/*/*/*'+sid+'*.jsonl'))
    if len(files)!=1:raise RuntimeError('Session source not unique: '+sid)
    counts=[];contexts=[];boundaries=[]
    for line in files[0].read_text(encoding='utf-8').splitlines():
        e=json.loads(line);p=e.get('payload',{})
        if e['type']=='turn_context':contexts.append({k:p.get(k) for k in ['model','effort','service_tier']})
        if e['type']=='event_msg' and p.get('type') in ['task_started','task_complete']:boundaries.append({'time':e['timestamp'],'type':p['type']})
        if e['type']=='event_msg' and p.get('type')=='token_count' and p.get('info'):counts.append({'time':e['timestamp'],'usage':p['info']['total_token_usage']})
    if any(b['usage']['input_tokens']<a['usage']['input_tokens'] for a,b in zip(counts,counts[1:])):raise RuntimeError('Counter reset requires manual accounting')
    return {'session_id':sid,'contexts':contexts,'boundaries':boundaries,'usage_cutoff':counts[-1]['time'],'usage':counts[-1]['usage'],'elapsed_seconds':seconds(boundaries[0]['time'],boundaries[-1]['time']),'note':'First task start to last completion, including user wait, setup and reporting. Latest cumulative usage; no counter decrease observed.'}
a=session('01a07c5e-f9a6-77c0-b550-aa1ab22fa8d3');b=session('01a07c80-ab84-7701-9f2a-98dd04914658')
old=read(LAB/'game-astra-luna-01/logs/metrics.json')
worker=old['worker_total'];total={k:b['usage'].get(k,0)+worker.get(k,0) for k in ['input_tokens','cached_input_tokens','output_tokens','reasoning_output_tokens']}
total['total_tokens']=total['input_tokens']+total['output_tokens']
result={'captured_utc':datetime.now(timezone.utc).isoformat(),'solo':a,'hybrid_parent':b,'hybrid_worker':worker,'hybrid_total':total,'hybrid_original_metrics':old,'baseline_match':read(LAB/'game-astra-solo-01/run.json')['baseline_manifest_sha256'].lower()==read(LAB/'game-astra-luna-01/run.json')['baseline_manifest_sha256'].lower(),'notes':['Source run.json and earlier metrics remain unchanged.','Solo final usage supplemented from local session metadata; includes both original turns.','Hybrid uses latest parent cumulative plus worker total, including failed preflight. This differs from the earlier cutoff report.','No inference of actual served tier or monetary cost. No claim of equivalent acceptance coverage.']}
(ROOT/'metrics.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'solo':a['usage'],'hybrid':total,'seconds':[a['elapsed_seconds'],b['elapsed_seconds']]},indent=2))
