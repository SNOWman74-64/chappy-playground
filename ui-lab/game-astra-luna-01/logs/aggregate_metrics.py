import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
LOG = ROOT / 'logs'
PARENT = Path('C:/Users/user/.codex/sessions/2026/09/08/rollout-2026-09-08T00-33-22-01a07c80-ab84-7701-9f2a-98dd04914658.jsonl')
KEYS = ['input_tokens', 'cached_input_tokens', 'output_tokens', 'reasoning_output_tokens']
def read_events(path):
    out = []
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        try: out.append(json.loads(line))
        except json.JSONDecodeError: pass
    return out
def stamp(s): return datetime.fromisoformat(s.strip().replace('Z', '+00:00'))
events = read_events(PARENT)
usage_rows = [e for e in events if e.get('payload', {}).get('type') == 'token_count' and e['payload'].get('info')]
messages = [e for e in events if e.get('type') == 'response_item' and e.get('payload', {}).get('role') == 'user']
boundary = next((e['timestamp'] for e in messages if any('lunaは実装に専念' in c.get('text', '') for c in e['payload'].get('content', []))), None)
before = [e for e in usage_rows if boundary and e['timestamp'] < boundary]
base = before[-1]['payload']['info']['total_token_usage'] if before else dict.fromkeys(KEYS, 0)
last = usage_rows[-1]
parent = last['payload']['info']['total_token_usage']
workers = []
for name in ['worker-preflight', 'stage1', 'stage2', 'corrections', 'responsive-fix']:
    path = LOG / (name + '.jsonl')
    if not path.exists(): continue
    rows = read_events(path)
    finished = [e for e in rows if e.get('type') == 'turn.completed']
    start, end = LOG / (name+'-start.txt'), LOG / (name+'-end.txt')
    workers.append(dict(stage=name, usage=finished[-1].get('usage') if finished else None,
        start_utc=start.read_text().strip() if start.exists() else None,
        end_utc=end.read_text().strip() if end.exists() else None,
        wall_seconds=(stamp(end.read_text())-stamp(start.read_text())).total_seconds() if start.exists() and end.exists() else None))
child = {k: sum((w['usage'] or {}).get(k, 0) for w in workers) for k in KEYS}
newchild = {k: sum((w['usage'] or {}).get(k, 0) for w in workers if w['stage'] != 'worker-preflight') for k in KEYS}
out = dict(recorded_at=datetime.now(timezone.utc).isoformat(), parent_usage_cutoff=last['timestamp'],
    parent_total={k:parent.get(k) for k in KEYS}, parent_before_role_change={k:base.get(k) for k in KEYS},
    parent_since_role_change={k:parent.get(k,0)-base.get(k,0) for k in KEYS}, worker_stages=workers,
    worker_total=child, worker_since_role_change=newchild,
    parent_plus_worker_total={k:parent.get(k,0)+child[k] for k in KEYS},
    parent_plus_worker_since_role_change={k:parent.get(k,0)-base.get(k,0)+newchild[k] for k in KEYS},
    original_parent_start=messages[0]['timestamp'] if messages else None, role_change_boundary=boundary,
    notes=['Parent counts use one latest cumulative row; child counts use one turn.completed per CLI call.',
           'Cached input and reasoning output are subsets; do not add them to input/output.',
           'Counts end at recorded cutoff; subsequent bookkeeping and final response are excluded.',
           'Process wall time includes model processing, tools and waiting; it is not active cognitive time.'])
end=datetime.now(timezone.utc)
parent_wall=(end-stamp(boundary)).total_seconds() if boundary else None
child_wall=sum(w['wall_seconds'] or 0 for w in workers if w['stage']!='worker-preflight')
out['timing_since_role_change']={'start_utc':boundary,'end_utc':end.isoformat(),'parent_wall_seconds_including_wait':parent_wall,'worker_process_wall_seconds':child_wall,'summed_process_seconds_including_overlap':parent_wall+child_wall if parent_wall else None,'elapsed_seconds':parent_wall,'parent_active_seconds':None,'parent_exact_wait_seconds':None,'reason':'Parent wall includes browser work, coordination, logs and worker waiting; parent/worker overlap. Active and waiting time cannot be exactly partitioned from these records.'}
(LOG / 'metrics.json').write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
(LOG / 'parent-usage-raw.json').write_text(json.dumps({'before_role_change':before[-1] if before else None,'latest':last},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(out, ensure_ascii=False, indent=2))
