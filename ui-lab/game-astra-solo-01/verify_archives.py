from pathlib import Path
import json,hashlib,zipfile,datetime
root=Path(__file__).resolve().parent/'snapshots'
records=[]
for stage in ['initial','final']:
    path=root/f'{stage}.zip';m=json.loads((root/f'{stage}-manifest.json').read_text(encoding='utf-8'))
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    assert digest==m['archive_sha256']
    with zipfile.ZipFile(path) as z:
        assert z.testzip() is None
        assert set(z.namelist())==set(m['files'])
        for name,expected in m['files'].items():assert hashlib.sha256(z.read(name)).hexdigest()==expected,name
    records.append({'stage':stage,'status':'PASS','files':len(m['files']),'sha256':digest})
result={'verified_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'archives':records,'note':'run.json inside ZIP cannot contain its own archive hash; authoritative archive SHA256 is in the external manifest and current run.json.'}
(root/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
