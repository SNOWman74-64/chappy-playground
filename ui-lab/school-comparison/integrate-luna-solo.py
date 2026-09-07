"""Register the completed solo run without modifying its implementation."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent
LAB=ROOT.parent
assert (ROOT/'logs/school-luna-solo-process.json').exists(), 'Solo is still running'
assert (ROOT/'logs/school-luna-solo-desktop.png').exists(), 'Missing preview'
p=ROOT/'index.html';s=p.read_text(encoding='utf-8')
if 'data-luna-solo' not in s:
    anchor='    </div>\n\n    <div class="links">'
    card='''      <article class="site" data-luna-solo>
        <a class="preview" href="../school-luna-solo/"><img src="logs/school-luna-solo-desktop.png" alt="Luna xhigh 単騎版のプレビュー"></a>
        <div class="body"><small>VARIANT F / XHIGH SOLO / PRIORITY REQUESTED</small>
          <h2>GPT-5.6 Luna / 単騎</h2>
          <p>同じ設計書と写真からLuna xhighが単独制作。親からの修正指示なし。ブラウザ接続不可のため操作検証は未実施。</p>
          <a class="open" href="../school-luna-solo/">サイトFを開く →</a>
        </div>
      </article>
'''
    assert anchor in s
    s=s.replace(anchor,card+anchor,1)
    s=s.replace('5サイト制作比較','6サイト制作比較').replace('5つの青葉','6つの青葉').replace('5つのモデル設定','6つのモデル設定')
    s=s.replace('<th>Luna high</th>','<th>Luna high</th><th>Luna xhigh 単騎</th>').replace('colspan="6"','colspan="7"')
    s=s.replace('extra.medium,extra.high]','extra.medium,extra.high,extra.solo]')
    s=s.replace('n(extra.high.initial_usage?.output_tokens)]','n(extra.high.initial_usage?.output_tokens),n(extra.solo.initial_usage?.output_tokens)]')
    s=s.replace("extra.high.observed_effort??'未確認']","extra.high.observed_effort??'未確認',extra.solo.observed_effort??'未確認']")
    s=s.replace('<a href="LUNA-COMPARISON.md">','<a href="LUNA-SOLO.md">Luna単騎の条件・ログ</a>\n      <a href="LUNA-COMPARISON.md">')
    s=s.replace('全サイトとも架空校のデモで','単騎版はLuna自身が検証も担当し、親からの修正指示はありません。全サイトとも架空校のデモで')
    p.write_text(s,encoding='utf-8')
p=LAB/'catalog.json';c=json.loads(p.read_text(encoding='utf-8'))
if not any(x['id']=='school-luna-solo' for x in c['mocks']):
    c['mocks'].append({'id':'school-luna-solo','title':'青葉高等学校 — Luna xhigh 単騎','shortTitle':'青葉高等学校 — Luna単騎','summary':'Luna xhigh / Fast指定。共通設計から実装・検証・修正まで単独で担当した比較案。','previewPath':'./school-luna-solo/','designPath':'./school-luna-solo/DESIGN.md','retrospectivePath':'./school-luna-solo/RETROSPECTIVE.md','referenceUrl':'./school-comparison/DESIGN-PLAN.md','thumbnail':'./school-comparison/logs/school-luna-solo-desktop.png','tags':['SCHOOL','LUNA XHIGH','SOLO'],'principles':['共通設計と写真','実装と検証を単独で担当','親からの修正指示なし']})
    p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Solo registered without implementation edits.')
