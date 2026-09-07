"""Extract only model metadata, timing and usage from the two task logs.
Run from UI Lab. No credentials or conversation bodies are exported.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent
LOG = ROOT / 'logs'
SESSIONS = Path('C:/Users/user/.codex/sessions/2026/09/07')
IDS = {'astra': '01a07bcb-d30b-77b3-95b3-f5607e4a4155', 'luna': '01a07bce-f210-79b0-899e-f5441da4e75e'}

def timestamp(name):
    p = LOG / name
    return p.read_text(encoding='utf-8-sig').strip() if p.exists() else None

def dt(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))

def seconds(start, end):
    return round((dt(end) - dt(start)).total_seconds(), 3) if start and end else None

def extract(id):
    contexts, counts = [], []
    for p in SESSIONS.glob('*' + id + '*.jsonl'):
        for line in p.open(encoding='utf-8'):
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            payload = event.get('payload', {})
            if event.get('type') == 'turn_context':
                contexts.append({k: payload.get(k) for k in ('model', 'effort', 'service_tier')})
            if event.get('type') == 'event_msg' and payload.get('type') == 'token_count' and payload.get('info'):
                counts.append({'timestamp': event['timestamp'], 'total': payload['info'].get('total_token_usage'), 'last': payload['info'].get('last_token_usage')})
    return contexts, counts

def cli_turns(filename):
    p = LOG / filename
    out = []
    if p.exists():
        for line in p.read_text(encoding='utf-8-sig').splitlines():
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue
            if d.get('type') == 'turn.completed':
                out.append(d['usage'])
    return out

now = datetime.now(timezone.utc).isoformat()
metrics = {'captured_at_utc': now, 'measurement_notes': [
    'Astra cumulative usage includes common planning, assets, both browser QA lanes and integration. It is a snapshot before the final assistant reply.',
    'Input tokens include cached input and repeated context; do not add cached input on top of input.',
    'Reasoning output tokens are part of output tokens; do not add them again.',
    'Fast was requested via service_tier=priority. Actual served tier is not present in turn_context; unknown is not confirmation.',
    'Model identity is the recorded model setting, not independent attestation of the upstream provider.',
    'Luna usage counters reset on each resumed CLI run (observed in session log). Sum completed turn usage from first implementation, correction and polish JSONL files; cached and reasoning subtotals are not added twice.',
    'Both used the same plan and shared stock photos. Shared asset preparation continued after implementation started; the parallel overlap is not a controlled benchmark.'
]}
for role,id in IDS.items():
    contexts,counts=extract(id)
    context=contexts[-1] if contexts else {}
    start=timestamp(role+'-start.txt')
    end=timestamp('astra-first-implementation-end.txt') if role=='astra' else json.loads((LOG/'luna-process.json').read_text(encoding='utf-8-sig'))['end']
    final=counts[-1] if counts else {}
    before_start=[c for c in counts if start and dt(c['timestamp'])<dt(start)]
    through_end=[c for c in counts if end and dt(c['timestamp'])<=dt(end)]
    baseline=before_start[-1]['total'] if before_start else {}
    initial=through_end[-1]['total'] if through_end else {}
    initial_delta={k:initial.get(k,0)-baseline.get(k,0) for k in initial} if initial else None
    metrics[role]={'session_id':id,'model':context.get('model'),'reasoning':context.get('effort'),'requested_service_tier':'priority' if role=='luna' else None,'actual_service_tier':context.get('service_tier'),'initial_start_utc':start,'initial_end_utc':end,'initial_seconds':seconds(start,end),'usage_captured_at_utc':final.get('timestamp'),'usage':final.get('total'),'initial_interval_usage_delta':initial_delta,'initial_interval_usage_note':'Difference of cumulative snapshots immediately before start and at/before end; boundaries may not align with model turns. Includes any preparation/coordination performed in the interval.'}
    (LOG/(role+'-usage-timeline.json')).write_text(json.dumps({'contexts':contexts,'token_counts':counts},ensure_ascii=False,indent=2),encoding='utf-8')
metrics['luna']['correction_start_utc']=timestamp('luna-fix-start.txt')
metrics['luna']['correction_end_utc']=timestamp('luna-fix-end.txt')
metrics['luna']['correction_seconds']=seconds(timestamp('luna-fix-start.txt'),timestamp('luna-fix-end.txt'))
metrics['luna']['cli_first_turn_usage']=cli_turns('luna-events.jsonl')
metrics['luna']['cli_correction_turn_usage']=cli_turns('luna-fix-events.jsonl')
metrics['luna']['final_polish_start_utc']=timestamp('luna-polish-start.txt')
metrics['luna']['final_polish_end_utc']=timestamp('luna-polish-end.txt')
metrics['luna']['final_polish_seconds']=seconds(timestamp('luna-polish-start.txt'),timestamp('luna-polish-end.txt'))
metrics['luna']['cli_polish_turn_usage']=cli_turns('luna-polish-events.jsonl')
luna_turns=metrics['luna']['cli_first_turn_usage']+metrics['luna']['cli_correction_turn_usage']+metrics['luna']['cli_polish_turn_usage']
if luna_turns:
    keys=set().union(*(v.keys() for v in luna_turns))
    usage={k:sum(v.get(k,0) for v in luna_turns) for k in keys}
    usage['total_tokens']=usage.get('input_tokens',0)+usage.get('output_tokens',0)
    metrics['luna']['usage']=usage
    metrics['luna']['usage_source']='Sum of completed CLI turn usage across three separate invocations, not latest reset session counter.'
    metrics['luna']['usage_incomplete']=metrics['luna']['final_polish_end_utc'] is None
metrics['overall']={'session_start_utc':'2026-09-07T12:15:50+00:00','snapshot_end_utc':now,'elapsed_seconds':seconds('2026-09-07T12:15:50+00:00',now),'astra_verification_end_utc':timestamp('astra-verification-end.txt'),'luna_verification_end_utc':timestamp('luna-verification-end.txt')}
metrics['parallel_initial_overlap_seconds']=max(0,seconds(max(metrics['astra']['initial_start_utc'],metrics['luna']['initial_start_utc']),min(metrics['astra']['initial_end_utc'],metrics['luna']['initial_end_utc'])))
(ROOT/'metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(metrics,ensure_ascii=False,indent=2))
