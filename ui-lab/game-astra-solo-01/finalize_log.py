from pathlib import Path
import json,datetime,hashlib,subprocess
root=Path(__file__).resolve().parent
run=json.loads((root/'run.json').read_text(encoding='utf-8'))
run['incidents'][1]['detail']='Preflight environment page favicon.ico returned HTTP 404. Fixture, SVGs, keyboard and screenshot succeeded. Implemented site has an inline empty favicon; site route tests recorded no HTTP failures.'
run['incidents'] += [
 {'type':'self_test_finding','stage':'pre_initial','detail':'Select accessible labels included option text; explicit aria-label added.'},
 {'type':'self_test_finding','stage':'pre_initial','detail':'Skip-to-main anchor collided with hash routing; fixed. Initial keyboard test missed delayed navigation and was strengthened.'},
 {'type':'test_harness','stage':'pre_initial','detail':'First rerun used existing page JS; explicit reload required. Name-sort assertion initially observed old DOM; wait changed to rendered order.'},
 {'type':'dependency_probe','detail':'Default Python lacked PIL. Contact sheets generated with existing bundled Python; no dependency installed.'},
 {'type':'self_refinement','stage':'post_initial','detail':'Balanced mobile title, retained full event image, added upper beginner link, validated nested stored replies.'},
 {'type':'self_test_finding','stage':'post_initial','detail':'80-character unbroken title expanded breadcrumb to 1062px at 390px viewport. Wrap fix verified: document width 375px, no out-of-bounds element.'}
]
run['time_accounting']={'implementation_actor':'single same actor; no child time','design_seconds':None,'review_seconds':None,'integration_seconds':None,'tool_wait_seconds':None,'reason':'Design, implementation, self-review and tool waits interleave inside recorded stages; exact per-activity timing is not exposed. Stage wall times include waits and are not claimed to be active compute time. No parallel model calls.'}
run['evidence']={'initial_screenshots':'evidence/initial/','final_screenshots':'evidence/final/','self_acceptance':'TEST-REPORT.md','independent_acceptance':None,'scope':'17 self PASS criteria and 1 visual scoring criterion; independent evaluation unperformed','usage':'Unavailable, null per stage; no model CLI usage records exist.'}
run['permissions']={'prior_logs_relocation':'explicitly authorized by user','commit':False,'push':False,'publish':False,'delegation':False,'shared_catalog_edit':False,'dependency_install':False}
run['final_verification']={'fixed_input_check':'PASS','node_syntax_check':'PASS','static_study_check':'FAIL: catalog entry missing only','utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
(root/'run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
result=subprocess.run(['python','experiments/social-game/check_environment.py'],cwd=root.parent,capture_output=True,text=True)
(root/'evidence'/'fixed-input-final.txt').write_text(result.stdout+result.stderr,encoding='utf-8')
assert result.returncode==0
initial=root/'snapshots/initial.zip'
manifest=json.loads((root/'snapshots/initial-manifest.json').read_text(encoding='utf-8'))
assert hashlib.sha256(initial.read_bytes()).hexdigest()==manifest['archive_sha256'],'Initial snapshot changed'
print('Final log updated; fixed inputs PASS; initial snapshot SHA256 unchanged.')
