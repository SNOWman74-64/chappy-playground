from pathlib import Path
import json,hashlib,zipfile,datetime,sys,os,stat
root=Path(__file__).resolve().parent
stage=sys.argv[1]
assert stage in ['initial','final']
folder=root/'snapshots';folder.mkdir(exist_ok=True)
archive=folder/f'{stage}.zip'
if archive.exists():raise SystemExit('Refusing to overwrite existing snapshot')
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
run=json.loads((root/'run.json').read_text(encoding='utf-8'))
run['status']='initial_submitted_self_verified' if stage=='initial' else 'complete_self_verified_independent_review_not_performed'
run[stage+'_snapshot']={'path':f'snapshots/{stage}.zip','created_utc':now,'sha256':None,'protection':'Read-only filesystem attribute plus separately recorded SHA256; not administrator-proof WORM storage.'}
if stage=='initial':
    s=run['stages'][-1];s['end_utc']=now;s['duration_seconds']=(datetime.datetime.fromisoformat(now)-datetime.datetime.fromisoformat(s['start_utc'].replace('Z','+00:00'))).total_seconds()
    run['stages'].append({'name':'post_initial_self_refinement_and_verification','start_utc':now,'end_utc':None,'duration_seconds':None,'waiting_seconds':None,'notes':'Self refinement only. No independent reviewer or external advice.'})
else:
    s=run['stages'][-1];s['end_utc']=now;s['duration_seconds']=(datetime.datetime.fromisoformat(now)-datetime.datetime.fromisoformat(s['start_utc'].replace('Z','+00:00'))).total_seconds()
run['tools']['browser']='Chromium 152.0.7977.77 via Playwright MCP (MCP package version unavailable)'
run['acceptance']=[{'id':id,'self':'scored' if id=='V02' else 'PASS','independent':'not_performed','evidence':'TEST-REPORT.md'} for id in ['ENV','V01','V02','D01','D02','S01','A01','T01','T02','B01','B02','B03','B04','B05','P01','P02','K01','R01']]
run['static_check']={'status':'FAIL','reason':'Exactly one catalog entry required; shared catalog edit prohibited by experiment README','evidence':'evidence/static-check.json'}
run['usage_by_stage']=[{'stage':s['name'],'input':None,'cached_input':None,'output':None,'reasoning_output':None,'reason':'No per-call model usage exposed; no model CLI calls.'} for s in run['stages']]
(root/'run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files=sorted(p for p in root.rglob('*') if p.is_file() and 'snapshots' not in p.relative_to(root).parts and '__pycache__' not in p.parts)
manifest={str(p.relative_to(root)).replace('\\','/'):sha(p) for p in files}
with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED) as z:
    for p in files:z.write(p,p.relative_to(root))
checksum=sha(archive)
manifest_path=folder/f'{stage}-manifest.json'
manifest_path.write_text(json.dumps({'created_utc':now,'archive_sha256':checksum,'files':manifest},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
os.chmod(archive,stat.S_IREAD);os.chmod(manifest_path,stat.S_IREAD)
run[stage+'_snapshot']['sha256']=checksum
(root/'run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'stage':stage,'created_utc':now,'files':len(files),'sha256':checksum,'archive':str(archive)},ensure_ascii=False))
